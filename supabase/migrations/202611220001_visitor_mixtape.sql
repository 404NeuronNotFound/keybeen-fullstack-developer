-- Run once in Supabase's SQL editor. Access is through the server-only API.
create table if not exists public.mixtape_tracks (
  id uuid primary key default gen_random_uuid(),
  video_id text not null unique check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (length(title) between 1 and 200),
  artist text not null check (length(artist) between 1 and 120),
  nickname text not null default 'A visitor' check (length(nickname) between 1 and 40),
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);
create table if not exists public.mixtape_votes (
  track_id uuid not null references public.mixtape_tracks(id) on delete cascade,
  visitor_hash text not null,
  primary key (track_id, visitor_hash)
);
create table if not exists public.mixtape_events (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists mixtape_events_rate_idx on public.mixtape_events(ip_hash, created_at desc);
alter table public.mixtape_tracks enable row level security;
alter table public.mixtape_votes enable row level security;
alter table public.mixtape_events enable row level security;
revoke all on public.mixtape_tracks, public.mixtape_votes, public.mixtape_events from anon, authenticated;

create or replace function public.mixtape_list(p_visitor text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(item order by created_at desc), '[]'::jsonb)
  from (
    select t.created_at, jsonb_build_object(
      'id', t.id, 'videoId', t.video_id, 'title', t.title, 'artist', t.artist,
      'nickname', t.nickname, 'createdAt', t.created_at,
      'likes', (select count(*) from public.mixtape_votes v where v.track_id = t.id),
      'liked', exists(select 1 from public.mixtape_votes v where v.track_id = t.id and v.visitor_hash = p_visitor)
    ) item from public.mixtape_tracks t where not t.hidden order by t.created_at desc limit 200
  ) tracks;
$$;

create or replace function public.mixtape_mutate(
  p_action text, p_visitor text, p_ip text, p_video_id text default null,
  p_title text default null, p_artist text default null, p_nickname text default null,
  p_track_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare recent_count bigint; action_count bigint;
begin
  -- Serialize decisions by network, and mutations affecting the same video/track.
  perform pg_advisory_xact_lock(hashtextextended('mixtape:ip:' || p_ip, 0));
  select count(*) into recent_count from public.mixtape_events
    where ip_hash = p_ip and created_at > now() - interval '1 minute';
  if recent_count >= 30 then raise exception 'MIXTAPE_RATE_LIMIT'; end if;
  if p_action = 'add' then
    select count(*) into action_count from public.mixtape_events
      where ip_hash = p_ip and action = 'add' and created_at > now() - interval '1 hour';
    if action_count >= 3 then raise exception 'MIXTAPE_RATE_LIMIT'; end if;
    perform pg_advisory_xact_lock(hashtextextended('mixtape:add', 0));
    if exists(select 1 from public.mixtape_tracks where video_id = p_video_id) then raise exception 'MIXTAPE_DUPLICATE'; end if;
    if (select count(*) from public.mixtape_tracks where not hidden) >= 200 then raise exception 'MIXTAPE_FULL'; end if;
    insert into public.mixtape_tracks(video_id, title, artist, nickname)
      values (p_video_id, p_title, p_artist, coalesce(nullif(p_nickname, ''), 'A visitor'));
  elsif p_action = 'like' then
    perform pg_advisory_xact_lock(hashtextextended('mixtape:track:' || p_track_id::text, 0));
    if not exists(select 1 from public.mixtape_tracks where id = p_track_id and not hidden) then raise exception 'MIXTAPE_NOT_FOUND'; end if;
    if exists(select 1 from public.mixtape_votes where track_id = p_track_id and visitor_hash = p_visitor) then
      delete from public.mixtape_votes where track_id = p_track_id and visitor_hash = p_visitor;
    else
      insert into public.mixtape_votes(track_id, visitor_hash) values (p_track_id, p_visitor);
    end if;
  elsif p_action = 'search' then
    select count(*) into action_count from public.mixtape_events
      where ip_hash = p_ip and action = 'search' and created_at > now() - interval '1 minute';
    if action_count >= 10 then raise exception 'MIXTAPE_RATE_LIMIT'; end if;
  else raise exception 'MIXTAPE_INVALID_ACTION';
  end if;
  insert into public.mixtape_events(ip_hash, action) values (p_ip, p_action);
  delete from public.mixtape_events where created_at < now() - interval '1 day';
  return 'null'::jsonb;
end;
$$;
revoke all on function public.mixtape_list(text) from public, anon, authenticated;
revoke all on function public.mixtape_mutate(text,text,text,text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.mixtape_list(text) to service_role;
grant execute on function public.mixtape_mutate(text,text,text,text,text,text,text,uuid) to service_role;

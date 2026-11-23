import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { MixtapeTrack } from '../src/types/mixtape';

export class MixtapeError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export interface MixtapeConfig {
  supabaseUrl?: string; supabaseKey?: string; youtubeKey?: string; secret?: string; localFile?: string;
}
export interface Mutation {
  action: 'add' | 'like' | 'search'; visitor: string; ip: string;
  videoId?: string; title?: string; artist?: string; nickname?: string; trackId?: string;
}
type StoredTrack = Omit<MixtapeTrack, 'likes' | 'liked'> & { hidden?: boolean };
interface LocalDatabase {
  tracks: StoredTrack[];
  votes: { trackId: string; visitor: string }[];
  events: { ip: string; action: string; at: number }[];
}
let queue: Promise<unknown> = Promise.resolve();
const withLock = <T>(work: () => Promise<T>): Promise<T> => {
  const result = queue.then(work, work); queue = result.catch(() => {}); return result;
};

async function load(file: string): Promise<LocalDatabase> {
  try { return JSON.parse(await readFile(file, 'utf8')) as LocalDatabase; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return { tracks: [], votes: [], events: [] };
  }
}
async function save(file: string, database: LocalDatabase) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(database), { encoding: 'utf8', mode: 0o600 });
  // Windows antivirus/indexers can briefly retain a handle after a write.
  // Keep the original intact and retry the atomic replacement rather than truncating it.
  try {
    for (let attempt = 0; ; attempt++) {
      try { await rename(temporary, file); break; }
      catch (error) {
        if (attempt >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
        await delay(25 * (attempt + 1));
      }
    }
  } finally { await unlink(temporary).catch(() => {}); }
}
async function rpc<T>(config: MixtapeConfig, name: string, body: unknown): Promise<T> {
  if (!config.supabaseUrl || !config.supabaseKey) throw new MixtapeError(503, 'The mixtape is not connected yet. Please try again later.');
  const response = await fetch(`${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: config.supabaseKey, Authorization: `Bearer ${config.supabaseKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { message?: string };
    const messages: Record<string, [number, string]> = {
      MIXTAPE_RATE_LIMIT: [429, 'A little too fast. Please wait before trying again.'],
      MIXTAPE_DUPLICATE: [409, 'This track is already on the mixtape. Give it a like instead.'],
      MIXTAPE_NOT_FOUND: [404, 'That track is no longer available.'],
      MIXTAPE_FULL: [409, 'The mixtape is full for now. Please try again later.'],
    };
    const known = Object.entries(messages).find(([code]) => error.message?.includes(code));
    if (known) throw new MixtapeError(...known[1]);
    throw new MixtapeError(503, 'The mixtape is temporarily unavailable. Please try again.');
  }
  return response.json() as Promise<T>;
}

export async function listTracks(config: MixtapeConfig, visitor: string): Promise<MixtapeTrack[]> {
  if (!config.localFile) return rpc(config, 'mixtape_list', { p_visitor: visitor });
  return withLock(async () => {
    const db = await load(config.localFile!);
    return db.tracks.filter(track => !track.hidden).map(track => ({
      ...track, likes: db.votes.filter(vote => vote.trackId === track.id).length,
      liked: db.votes.some(vote => vote.trackId === track.id && vote.visitor === visitor),
    })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
}

export async function mutateTracks(config: MixtapeConfig, input: Mutation): Promise<void> {
  if (!config.localFile) return rpc(config, 'mixtape_mutate', {
    p_action: input.action, p_visitor: input.visitor, p_ip: input.ip,
    p_video_id: input.videoId ?? null, p_title: input.title ?? null, p_artist: input.artist ?? null,
    p_nickname: input.nickname ?? null, p_track_id: input.trackId ?? null,
  });
  await withLock(async () => {
    const db = await load(config.localFile!);
    const now = Date.now();
    db.events = db.events.filter(event => event.at > now - 3600000);
    const recent = db.events.filter(event => event.ip === input.ip);
    if (recent.filter(event => event.at > now - 60000).length >= 30
      || (input.action === 'add' && recent.filter(event => event.action === 'add').length >= 3)
      || (input.action === 'search' && recent.filter(event => event.action === 'search' && event.at > now - 60000).length >= 10)) {
      throw new MixtapeError(429, 'A little too fast. Please wait before trying again.');
    }
    if (input.action === 'add') {
      if (db.tracks.some(track => track.videoId === input.videoId)) throw new MixtapeError(409, 'This track is already on the mixtape. Give it a like instead.');
      if (db.tracks.filter(track => !track.hidden).length >= 200) throw new MixtapeError(409, 'The mixtape is full for now. Please try again later.');
      db.tracks.push({ id: randomUUID(), videoId: input.videoId!, title: input.title!, artist: input.artist!, nickname: input.nickname || 'A visitor', createdAt: new Date().toISOString() });
    } else if (input.action === 'like') {
      if (!db.tracks.some(track => track.id === input.trackId && !track.hidden)) throw new MixtapeError(404, 'That track is no longer available.');
      const existing = db.votes.findIndex(vote => vote.trackId === input.trackId && vote.visitor === input.visitor);
      if (existing >= 0) db.votes.splice(existing, 1);
      else db.votes.push({ trackId: input.trackId!, visitor: input.visitor });
    }
    db.events.push({ ip: input.ip, action: input.action, at: now });
    await save(config.localFile!, db);
  });
}

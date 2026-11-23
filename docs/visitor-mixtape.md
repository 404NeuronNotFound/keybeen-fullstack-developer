# Visitor Mixtape

The Mixtape page is at `/#/mixtape`. Visitors can add a YouTube video, supply an optional nickname, like tracks, filter the playlist, and play tracks in a visible YouTube player that stays mounted across page navigation. Playback starts only after a visitor selects Play. Closing the player stops playback. YouTube controls handle pause, seeking, and volume; the queue advances when a track finishes. Some videos may be restricted by their uploader, country, or YouTube; the player includes an external fallback link.

## Local development

Run `npm run dev`. Vite serves the same `/api/mixtape` handler used in production. With no Supabase configuration, shared development data persists in `.data/mixtape.json`, with a private cookie signing key beside it. This folder is ignored by Git. Every browser connected to this server shares that playlist. No sample tracks are inserted.

YouTube-link lookup and playback work without an API key. In-app song/artist search is enabled only when `YOUTUBE_API_KEY` is set. Otherwise visitors can find the song on YouTube and paste its link. Track titles/channel names are verified on the server through YouTube oEmbed; client-provided metadata is ignored.

## Supabase and production setup

1. Create a Supabase project on the free plan.
2. Run [`supabase/migrations/202611220001_visitor_mixtape.sql`](../supabase/migrations/202611220001_visitor_mixtape.sql) in its SQL editor. It creates the tables and the `mixtape_list` / `mixtape_mutate` functions.
3. Add these **server-only** environment variables to the existing Vercel project (and optionally `.env.local`):

   ```text
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVER-SERVICE-ROLE-KEY
   MIXTAPE_VISITOR_SECRET=YOUR-STABLE-RANDOM-SECRET
   YOUTUBE_API_KEY=YOUR-YOUTUBE-DATA-API-V3-KEY
   ```

   `MIXTAPE_VISITOR_SECRET` is recommended to keep visitor cookies stable when rotating database keys; otherwise the service key signs cookies. `YOUTUBE_API_KEY` is optional for link submissions and required for in-app song search. Never add a `VITE_` prefix to private keys. Restart development or redeploy after changing settings. Do not paste secrets into source files or chat.

4. Enable YouTube Data API v3 in Google Cloud, create an API key, and restrict it to YouTube Data API v3. Requests originate on the server. Search uses explicit submits, a six-result limit, short caching, and per-network limits; Google quota still applies.
5. Deploy the existing repository to Vercel. Supabase hosts Postgres; Vercel hosts the existing portfolio and `/api/mixtape` server route. Prisma is optional; this implementation calls the protected Postgres functions through Supabase REST without another dependency.

Production deliberately returns an unavailable response if Supabase is missing. It never substitutes a temporary filesystem database in a serverless deployment. Connecting a public database or deploying has not been performed by the implementation itself.

## Data and moderation

Tables enable row-level security and expose no anonymous/authenticated table access. Database functions execute only for the server's service role. The API returns public track details and like counts, not visitor/network hashes or private keys.

Visitors get a signed, HTTP-only, SameSite cookie. This is an anonymous browser identity, not an account or verified person. Resetting cookies changes the identity. Per-network limits reduce abuse: three additions per hour, ten lookups per minute, thirty successful actions per minute. RPC locks make duplicates, limits, and like toggles consistent under concurrent submissions. The playlist allows 200 visible tracks. New additions appear when the page refreshes, every 30 seconds while visible, or immediately for the contributor.

To moderate, open `mixtape_tracks` in Supabase's Table Editor and set `hidden` to `true`. Hidden tracks disappear and cannot be liked. Existing playback can be stopped by the visitor. Hidden video IDs remain reserved so the same video cannot immediately be reposted. You can delete a row to remove it and its votes permanently. Do this deliberately in your own Supabase dashboard; no public deletion endpoint exists.

The application stores hashed anonymous/network identifiers for rate limits. Only successful recent events are retained (at most one day in Supabase, one hour locally); counts are not an anti-bot identity guarantee. Public nicknames and YouTube metadata remain until moderated. Include the mixtape's cookies and external YouTube playback in the site's privacy notice when publishing.

## Validation

Run `node --test --test-isolation=none tests/mixtape.test.mjs`, `npm run build`, and lint the changed files. Tests use an isolated temporary database and mocked provider calls; they never add test tracks to the real local playlist or Supabase. Tests cover input validation, origin checks, persistence, duplicate races, visitor likes, moderation, rate limits, search, canonical metadata, cookie tampering, backend errors, and player queue behavior. Supabase migration execution and live YouTube playback require the configured services and a browser.

Provider references: [YouTube search](https://developers.google.com/youtube/v3/docs/search/list), [YouTube player](https://developers.google.com/youtube/iframe_api_reference), [Supabase database functions](https://supabase.com/docs/guides/database/functions), [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).

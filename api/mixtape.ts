import type { IncomingMessage, ServerResponse } from 'node:http';
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { listTracks, MixtapeError, mutateTracks } from '../server/mixtapeStorage.js';
import type { MixtapeConfig } from '../server/mixtapeStorage.js';
import type { MixtapeVideo } from '../src/types/mixtape.js';

type Request = IncomingMessage & { body?: unknown };
const videoFormat = /^[a-zA-Z0-9_-]{11}$/;
const uuidFormat = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const metadataCache = new Map<string, { value: MixtapeVideo; expires: number }>();
const searchCache = new Map<string, { value: MixtapeVideo[]; expires: number }>();
let localSecret: Promise<string> | undefined;

export function parseYouTubeId(value: string): string | null {
  if (videoFormat.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(shorts|embed|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null;
    }
    return id && videoFormat.test(id) ? id : null;
  } catch { return null; }
}
function trimText(value: unknown, max: number) {
  return typeof value === 'string' ? Array.from(value).filter(character => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').trim().slice(0, max) : '';
}
function decodeTitle(value: unknown) {
  return trimText(value, 1000).replace(/&(amp|quot|apos|lt|gt);|&#(\d+);/g, (entity, name: string | undefined, code: string | undefined) => {
    const named: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
    if (name) return named[name];
    const point = Number(code); return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}
function cache<T>(map: Map<string, { value: T; expires: number }>, key: string, value: T) {
  if (map.size >= 100) map.delete(map.keys().next().value!);
  map.set(key, { value, expires: Date.now() + 600000 });
}
async function secretFor(config: MixtapeConfig): Promise<string> {
  if (config.secret || config.supabaseKey) return config.secret || config.supabaseKey!;
  if (!config.localFile) throw new MixtapeError(503, 'The mixtape is not connected yet. Please try again later.');
  localSecret ??= (async () => {
    const file = join(dirname(config.localFile!), 'mixtape-secret');
    await mkdir(dirname(file), { recursive: true });
    try { return await readFile(file, 'utf8'); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const value = randomBytes(32).toString('hex');
      try { await writeFile(file, value, { flag: 'wx', mode: 0o600 }); return value; }
      catch (writeError) { if ((writeError as NodeJS.ErrnoException).code === 'EEXIST') return readFile(file, 'utf8'); throw writeError; }
    }
  })();
  return localSecret;
}
function visitorId(req: Request, res: ServerResponse, secret: string, secure: boolean) {
  const hash = (text: string) => createHmac('sha256', secret).update(text).digest('hex');
  const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith('mixtape_visitor='))?.slice(16);
  const [id = '', signature = ''] = (cookie ?? '').split('.');
  const expected = hash(id);
  let visitor = id;
  if (!uuidFormat.test(id) || !/^[a-f0-9]{64}$/.test(signature) || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) visitor = randomUUID();
  res.setHeader('Set-Cookie', `mixtape_visitor=${visitor}.${hash(visitor)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure ? '; Secure' : ''}`);
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'local').split(',')[0].trim();
  return { visitor: hash(`visitor:${visitor}`), ip: hash(`ip:${ip}`) };
}
export async function videoMetadata(videoId: string): Promise<MixtapeVideo> {
  const cached = metadataCache.get(videoId);
  if (cached && cached.expires > Date.now()) return cached.value;
  const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new MixtapeError(422, 'This video is unavailable or cannot be embedded. Please choose another track.');
  const data = await response.json() as Record<string, unknown>;
  const value = { videoId, title: trimText(data.title, 200), artist: trimText(data.author_name, 120) };
  if (!value.title || !value.artist) throw new MixtapeError(422, 'Could not read this track. Please choose another video.');
  cache(metadataCache, videoId, value); return value;
}
async function searchVideos(query: string, key: string): Promise<MixtapeVideo[]> {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && cached.expires > Date.now()) return cached.value;
  const parameters = new URLSearchParams({ part: 'snippet', type: 'video', q: query, maxResults: '6', videoEmbeddable: 'true', videoCategoryId: '10', safeSearch: 'strict', key });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${parameters}`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new MixtapeError(503, 'Song search is unavailable right now. You can still paste a YouTube link.');
  const data = await response.json() as { items?: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string } }[] };
  const results = (data.items ?? []).filter(item => videoFormat.test(item.id?.videoId ?? '')).map(item => ({ videoId: item.id!.videoId!, title: trimText(decodeTitle(item.snippet?.title), 200), artist: trimText(decodeTitle(item.snippet?.channelTitle), 120) }));
  cache(searchCache, query.toLowerCase(), results); return results;
}
async function readBody(req: Request): Promise<Record<string, unknown>> {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new MixtapeError(415, 'Please send JSON.');
  let body = req.body;
  if (body === undefined) {
    let text = '';
    for await (const chunk of req) { text += chunk.toString(); if (Buffer.byteLength(text) > 2048) throw new MixtapeError(413, 'Submission is too large.'); }
    try { body = JSON.parse(text); } catch { throw new MixtapeError(400, 'Invalid submission.'); }
  } else if (typeof body === 'string') { try { body = JSON.parse(body); } catch { throw new MixtapeError(400, 'Invalid submission.'); } }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 2048) throw new MixtapeError(400, 'Invalid submission.');
  return body as Record<string, unknown>;
}

export async function handleMixtape(req: Request, res: ServerResponse, config: MixtapeConfig) {
  const send = (status: number, data: unknown) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(data)); };
  try {
    if (!['GET', 'POST'].includes(req.method ?? '')) { res.setHeader('Allow', 'GET, POST'); throw new MixtapeError(405, 'Method not supported.'); }
    if (req.headers.origin) {
      let allowed = false;
      try { allowed = new URL(req.headers.origin).host === req.headers.host; } catch { /* Reject malformed origins. */ }
      if (!allowed) throw new MixtapeError(403, 'Request not allowed.');
    }
    const identity = visitorId(req, res, await secretFor(config), !config.localFile);
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'GET') {
      const query = trimText(url.searchParams.get('q'), 120);
      if (query) {
        const id = parseYouTubeId(query);
        if (id) { await mutateTracks(config, { action: 'search', ...identity }); send(200, { results: [await videoMetadata(id)] }); return; }
        if (!config.youtubeKey) throw new MixtapeError(503, 'Paste a YouTube link to add a track, or find your song on YouTube first.');
        if (query.length < 2) throw new MixtapeError(400, 'Enter at least two characters.');
        await mutateTracks(config, { action: 'search', ...identity });
        send(200, { results: await searchVideos(query, config.youtubeKey) }); return;
      }
      send(200, { tracks: await listTracks(config, identity.visitor), searchEnabled: Boolean(config.youtubeKey) }); return;
    }
    const body = await readBody(req);
    if (body.action === 'add') {
      const id = typeof body.videoId === 'string' ? parseYouTubeId(body.videoId) : null;
      if (!id) throw new MixtapeError(400, 'Choose a valid YouTube video.');
      const nickname = trimText(body.nickname, 40) || 'A visitor';
      await mutateTracks(config, { action: 'search', ...identity });
      const video = await videoMetadata(id);
      await mutateTracks(config, { action: 'add', ...identity, ...video, nickname });
    } else if (body.action === 'like') {
      if (typeof body.trackId !== 'string' || !uuidFormat.test(body.trackId)) throw new MixtapeError(400, 'Choose a valid track.');
      await mutateTracks(config, { action: 'like', ...identity, trackId: body.trackId });
    } else throw new MixtapeError(400, 'Unknown action.');
    send(200, { tracks: await listTracks(config, identity.visitor), searchEnabled: Boolean(config.youtubeKey) });
  } catch (error) {
    if (error instanceof MixtapeError) send(error.status, { error: error.message });
    else send(503, { error: 'The mixtape is temporarily unavailable. Please try again.' });
  }
}

export default function handler(req: Request, res: ServerResponse) {
  return handleMixtape(req, res, { supabaseUrl: process.env.SUPABASE_URL, supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY, youtubeKey: process.env.YOUTUBE_API_KEY, secret: process.env.MIXTAPE_VISITOR_SECRET });
}

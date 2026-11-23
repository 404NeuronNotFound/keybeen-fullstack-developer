import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const modules = new Map();
function load(file) {
  if (modules.has(file)) return modules.get(file);
  const exports = {}; modules.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  new Function('require', 'exports', source)(name => {
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file), name);
    return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : path.join(base, 'index.ts'));
  }, exports);
  return exports;
}
const { handleMixtape, parseYouTubeId } = load(path.resolve('api/mixtape.ts'));
const { listTracks, mutateTracks } = load(path.resolve('server/mixtapeStorage.ts'));
const root = path.resolve('tests');
const originalFetch = globalThis.fetch;
const video = index => String(index).padStart(11, 'a');
const mutation = (index, overrides = {}) => ({ action: 'add', visitor: 'visitor-a', ip: 'network-a', videoId: video(index), title: `Track ${index}`, artist: 'Artist', nickname: 'Guest', ...overrides });

async function database(run) {
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(path.join(root, '.mixtape-test-'));
  const config = { localFile: path.join(directory, 'playlist.json'), secret: 'test-secret-not-a-real-credential' };
  try { await run(config); }
  finally { assert.ok(path.resolve(directory).startsWith(root + path.sep)); await rm(directory, { recursive: true, force: true }); }
}
async function request(config, { method = 'GET', url = '/api/mixtape', body, cookie, origin = 'http://localhost:5174', raw } = {}) {
  const req = Readable.from(raw === undefined ? [] : [raw]);
  Object.assign(req, { method, url, body, headers: { host: 'localhost:5174', origin, 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, socket: { remoteAddress: '127.0.0.1' } });
  const headers = {};
  let output;
  const res = { statusCode: 200, setHeader(key, value) { headers[key.toLowerCase()] = value; }, end(value) { output = JSON.parse(value); } };
  await handleMixtape(req, res, config);
  return { status: res.statusCode, body: output, headers, cookie: headers['set-cookie']?.split(';')[0] };
}

test('recognizes YouTube links and rejects arbitrary hosts, scripts, and malformed IDs', () => {
  const id = 'abcdefghijk';
  for (const url of [id, `https://youtu.be/${id}`, `https://www.youtube.com/watch?v=${id}&t=20`, `https://music.youtube.com/watch?v=${id}`, `https://youtube.com/shorts/${id}`]) assert.equal(parseYouTubeId(url), id);
  for (const url of ['javascript:alert(1)', `https://youtube.com.evil.test/watch?v=${id}`, `https://evil.test/${id}`, 'https://youtube.com/watch?v=bad', 'https://youtube.com/playlist?list=abc']) assert.equal(parseYouTubeId(url), null);
});

test('persists tracks across reads, gives each visitor one togglable like, and shares counts', () => database(async config => {
  await mutateTracks(config, mutation(1));
  const [track] = await listTracks(config, 'visitor-a');
  await mutateTracks(config, { action: 'like', visitor: 'visitor-a', ip: 'network-a', trackId: track.id });
  assert.equal((await listTracks(config, 'visitor-a'))[0].liked, true);
  assert.equal((await listTracks(config, 'visitor-b'))[0].liked, false);
  assert.equal((await listTracks(config, 'visitor-b'))[0].likes, 1);
  await mutateTracks(config, { action: 'like', visitor: 'visitor-a', ip: 'network-a', trackId: track.id });
  assert.equal((await listTracks(config, 'visitor-a'))[0].likes, 0);
  const persisted = JSON.parse(await readFile(config.localFile, 'utf8'));
  assert.equal(persisted.tracks.length, 1);
}));

test('serializes simultaneous duplicate submissions', () => database(async config => {
  const results = await Promise.allSettled([mutateTracks(config, mutation(2)), mutateTracks(config, mutation(2))]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.status, 409);
  assert.equal((await listTracks(config, 'visitor-a')).length, 1);
}));

test('enforces persistent submission and search limits', () => database(async config => {
  for (let i = 0; i < 3; i++) await mutateTracks(config, mutation(i + 10));
  await assert.rejects(mutateTracks(config, mutation(14)), error => error.status === 429);
  for (let i = 0; i < 10; i++) await mutateTracks(config, { action: 'search', visitor: 'v', ip: 'other-network' });
  await assert.rejects(mutateTracks(config, { action: 'search', visitor: 'v', ip: 'other-network' }), error => error.status === 429);
}));

test('rejects likes for missing tracks and hides moderated tracks', () => database(async config => {
  await mutateTracks(config, mutation(20));
  const db = JSON.parse(await readFile(config.localFile, 'utf8')); db.tracks[0].hidden = true;
  await fs.promises.writeFile(config.localFile, JSON.stringify(db));
  assert.equal((await listTracks(config, 'visitor-a')).length, 0);
  await assert.rejects(mutateTracks(config, { action: 'like', visitor: 'v', ip: 'ip', trackId: db.tracks[0].id }), error => error.status === 404);
}));

test('API validates origin, method, payload, and missing production configuration', () => database(async config => {
  assert.equal((await request(config, { origin: 'https://other.test' })).status, 403);
  assert.equal((await request(config, { origin: 'invalid-origin' })).status, 403);
  assert.equal((await request(config, { method: 'DELETE' })).status, 405);
  assert.equal((await request(config, { method: 'POST', raw: '{bad' })).status, 400);
  assert.equal((await request(config, { method: 'POST', body: { action: 'add', videoId: 'bad' } })).status, 400);
  assert.equal((await request(config, { method: 'POST', body: { action: 'like', trackId: 'bad' } })).status, 400);
  assert.equal((await request({})).status, 503);
}));

test('API issues a signed cookie, validates metadata on the server, and preserves visitor likes', () => database(async config => {
  globalThis.fetch = async url => {
    assert.ok(String(url).startsWith('https://www.youtube.com/oembed?'));
    return new Response(JSON.stringify({ title: 'Verified title', author_name: 'Verified channel' }), { status: 200 });
  };
  try {
    const first = await request(config);
    assert.equal(first.status, 200); assert.equal(first.body.searchEnabled, false);
    assert.ok(first.headers['set-cookie'].includes('HttpOnly')); assert.ok(first.headers['set-cookie'].includes('SameSite=Lax'));
    const added = await request(config, { method: 'POST', cookie: first.cookie, body: { action: 'add', videoId: video(30), nickname: 'Listener', title: 'Forged title', artist: 'Forged artist' } });
    assert.equal(added.status, 200); assert.equal(added.body.tracks[0].title, 'Verified title'); assert.equal(added.body.tracks[0].artist, 'Verified channel');
    const track = added.body.tracks[0];
    const liked = await request(config, { method: 'POST', cookie: first.cookie, body: { action: 'like', trackId: track.id } });
    assert.equal(liked.body.tracks[0].liked, true);
    const reloaded = await request(config, { cookie: first.cookie }); assert.equal(reloaded.body.tracks[0].liked, true);
    const tampered = await request(config, { cookie: first.cookie.replace(/.$/, first.cookie.endsWith('a') ? 'b' : 'a') }); assert.equal(tampered.body.tracks[0].liked, false);
    const searched = await request(config, { cookie: first.cookie, url: `/api/mixtape?q=https://youtu.be/${video(31)}` }); assert.equal(searched.body.results[0].title, 'Verified title');
    assert.equal((await request(config, { url: '/api/mixtape?q=song%20name' })).status, 503);
  } finally { globalThis.fetch = originalFetch; }
}));

test('YouTube search filters to embeddable music and decodes provider titles', () => database(async config => {
  globalThis.fetch = async url => {
    const parsed = new URL(url); assert.equal(parsed.searchParams.get('videoEmbeddable'), 'true'); assert.equal(parsed.searchParams.get('videoCategoryId'), '10');
    return new Response(JSON.stringify({ items: [{ id: { videoId: video(40) }, snippet: { title: 'Song &amp; Artist &#39;Live&#39;', channelTitle: 'Channel' } }] }), { status: 200 });
  };
  try { const result = await request({ ...config, youtubeKey: 'test-key' }, { url: '/api/mixtape?q=test-song-name' }); assert.equal(result.status, 200); assert.equal(result.body.results[0].title, "Song & Artist 'Live'"); }
  finally { globalThis.fetch = originalFetch; }
}));

test('Supabase requests keep privileged keys server-side and map database errors', async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://example.supabase.co/rest/v1/rpc/mixtape_list'); assert.equal(init.headers.apikey, 'private-test-key');
    return new Response('[]', { status: 200 });
  };
  try {
    assert.deepEqual(await listTracks({ supabaseUrl: 'https://example.supabase.co', supabaseKey: 'private-test-key' }, 'visitor'), []);
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'MIXTAPE_DUPLICATE' }), { status: 400 });
    await assert.rejects(mutateTracks({ supabaseUrl: 'https://example.supabase.co', supabaseKey: 'private-test-key' }, mutation(50)), error => error.status === 409);
  } finally { globalThis.fetch = originalFetch; }
});

test('player queue stays global, moves between tracks, and closes cleanly', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const { useMixtapePlayerStore: store } = load(path.resolve('src/store/mixtapePlayerStore.ts'));
  const queue = [{ videoId: video(60), title: 'One', artist: 'Artist' }, { videoId: video(61), title: 'Two', artist: 'Artist' }];
  assert.equal(store.getState().video, null); store.getState().play(queue[0], queue); assert.equal(store.getState().video.title, 'One');
  store.getState().next(); assert.equal(store.getState().video.title, 'Two'); store.getState().next(); assert.equal(store.getState().video.title, 'Two');
  store.getState().previous(); assert.equal(store.getState().video.title, 'One'); store.getState().stop(); assert.equal(store.getState().video, null);
});

test('iframe sets referrer and media permissions before navigating with the real site origin', () => {
  const previousDocument = globalThis.document;
  const assignments = [];
  const frame = new Proxy({}, { set(target, property, value) { assignments.push(property); target[property] = value; return true; } });
  globalThis.document = { createElement: tag => { assert.equal(tag, 'iframe'); return frame; } };
  try {
    const { createYouTubeFrame } = load(path.resolve('src/utils/youtubePlayer.ts'));
    const result = createYouTubeFrame('abcdefghijk', 'A title', 'http://127.0.0.1:5173');
    assert.equal(result.referrerPolicy, 'strict-origin-when-cross-origin');
    assert.ok(result.allow.includes('autoplay')); assert.ok(result.allow.includes('encrypted-media'));
    assert.ok(assignments.indexOf('referrerPolicy') < assignments.indexOf('src'));
    assert.ok(assignments.indexOf('allow') < assignments.indexOf('src'));
    const url = new URL(result.src); assert.equal(url.hostname, 'www.youtube-nocookie.com');
    assert.equal(url.searchParams.get('origin'), 'http://127.0.0.1:5173');
    assert.equal(url.searchParams.get('enablejsapi'), '1');
    assert.equal(url.searchParams.get('mute'), '1');
    assert.equal(url.searchParams.get('autoplay'), '0');
    assert.throws(() => createYouTubeFrame('invalid', 'Title', 'http://127.0.0.1:5173'));
  } finally { if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument; }
});

test('playback errors distinguish owner restrictions, unavailable videos, identity, and HTML5 failures', () => {
  const { youtubePlaybackError } = load(path.resolve('src/utils/youtubePlayer.ts'));
  for (const code of [101, 150]) { assert.match(youtubePlaybackError(code), /uploader does not allow/); assert.ok(youtubePlaybackError(code).includes(String(code))); }
  assert.match(youtubePlaybackError(153), /identify this embedded player/);
  assert.match(youtubePlaybackError(100), /removed or made private/);
  assert.match(youtubePlaybackError(5), /could not start video playback/);
  assert.match(youtubePlaybackError(999), /error 999/);
});

test('page navigation keeps live players outside snapshot transitions and animates only content', () => {
  const previousDocument = globalThis.document, previousWindow = globalThis.window;
  let hasPlayer = true, snapshots = 0, changes = 0, animations = 0;
  const surface = {}, livePlayer = { iframe: {} };
  const originalFrame = livePlayer.iframe;
  const preference = { matches: false, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { matchMedia: () => preference };
  globalThis.document = {
    documentElement: { dataset: {} }, visibilityState: 'visible',
    querySelector(selector) {
      if (selector === '#main-content') return {};
      if (selector === '.mixtape-floating-player') return hasPlayer ? livePlayer : null;
      if (selector === '.page-transition-surface') return surface;
      return null;
    },
    startViewTransition(update) { snapshots++; update(); return { ready: Promise.resolve(), finished: new Promise(() => {}), skipTransition() {} }; },
  };
  const gsap = { fromTo(target, _from, to) { assert.equal(target, surface); animations++; return { progress() { to.onComplete(); } }; } };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.resolve('src/utils/pageTransition.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText;
  new Function('require', 'exports', source)(name => name === 'react-dom' ? { flushSync: update => update() } : { gsap }, exports);
  try {
    for (let i = 0; i < 3; i++) exports.transitionPage(() => changes++);
    assert.equal(changes, 3); assert.equal(snapshots, 0); assert.equal(animations, 3);
    assert.equal(livePlayer.iframe, originalFrame);
    exports.settlePageTransition();
    assert.equal(document.documentElement.dataset.pageTransition, undefined);
    hasPlayer = false;
    exports.transitionPage(() => changes++); assert.equal(snapshots, 1); assert.equal(animations, 3);
    exports.settlePageTransition();
    hasPlayer = true; preference.matches = true;
    exports.transitionPage(() => changes++); assert.equal(changes, 5); assert.equal(snapshots, 1); assert.equal(animations, 3);
  } finally {
    exports.settlePageTransition();
    if (previousDocument === undefined) delete globalThis.document; else globalThis.document = previousDocument;
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
});

test('navbar mute immediately controls a ready player, honors late readiness, and unsubscribes', () => {
  const { useSoundStore: sound } = load(path.resolve('src/store/soundStore.ts'));
  const { bindPlayerMute } = load(path.resolve('src/utils/playerMute.ts'));
  const calls = [];
  sound.setState({ muted: true, musicOptedIn: false });
  const release = bindPlayerMute({ mute: () => calls.push('mute'), unMute: () => calls.push('unmute') });
  assert.deepEqual(calls, ['mute']);
  sound.getState().toggleMuted(); assert.equal(calls.at(-1), 'unmute');
  sound.getState().toggleMuted(); assert.equal(calls.at(-1), 'mute');
  release(); const count = calls.length;
  sound.getState().toggleMuted(); assert.equal(calls.length, count);
  // A new iframe must read the current setting when ready, not an earlier render.
  sound.setState({ muted: true, musicOptedIn: false });
  const late = [];
  const stopLate = bindPlayerMute({ mute: () => late.push('mute'), unMute: () => late.push('unmute') });
  assert.deepEqual(late, ['mute']); stopLate();
});

test('selecting and advancing tracks preserve the global audio preference', () => {
  const { useSoundStore: sound } = load(path.resolve('src/store/soundStore.ts'));
  const { useMixtapePlayerStore: player } = load(path.resolve('src/store/mixtapePlayerStore.ts'));
  const tracks = [{ videoId: video(70), title: 'One', artist: 'Artist' }, { videoId: video(71), title: 'Two', artist: 'Artist' }];
  sound.setState({ muted: false, musicOptedIn: true });
  player.getState().play(tracks[0], tracks); assert.equal(sound.getState().muted, false); assert.equal(sound.getState().musicOptedIn, true);
  sound.getState().toggleMuted(); player.getState().next(); assert.equal(sound.getState().muted, true);
  player.getState().play(tracks[0], tracks); assert.equal(sound.getState().muted, true);
  player.getState().stop(); sound.setState({ muted: true, musicOptedIn: false });
});

import { useCallback, useEffect, useRef, useState } from 'react';
import { CassetteTape, Heart, ListMusic, LoaderCircle, Play, Plus, RefreshCw, Search } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { MixtapeAddTrack } from '../components/ui/MixtapeAddTrack';
import { getMixtape, submitMixtape, trackArtwork } from '../utils/mixtapeApi';
import type { MixtapeResponse, MixtapeTrack } from '../types/mixtape';
import { useMixtapePlayerStore } from '../store/mixtapePlayerStore';
import { isPageTransitioning } from '../utils/pageTransition';
import { MIXTAPE_ENABLED } from '../constants/mixtape';
import '../styles/mixtape.css';

gsap.registerPlugin(useGSAP);

export function MixtapePage() {
  return MIXTAPE_ENABLED ? <MixtapeLivePage /> : <MixtapeConstruction />;
}

function MixtapeConstruction() {
  return <div className="page mixtape-page mixtape-closed">
    <div className="mixtape-closed-ui" inert aria-hidden="true"><MixtapeLivePage preview /></div>
    <div className="mixtape-closed-overlay">
      <h1 className="sr-only">Visitor Mixtape — Under construction. Coming soon.</h1>
      <div className="mixtape-cordon-tape mixtape-cordon-down" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <span key={index}>UNDER CONSTRUCTION · COMING SOON</span>)}</div>
      <div className="mixtape-cordon-tape mixtape-cordon-up" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <span key={index}>UNDER CONSTRUCTION · COMING SOON</span>)}</div>
    </div>
  </div>;
}

function MixtapeLivePage({ preview = false }: { preview?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const requestVersion = useRef(0);
  const [data, setData] = useState<MixtapeResponse>({ tracks: [], searchEnabled: false });
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [sort, setSort] = useState<'latest' | 'liked'>('latest');
  const [filter, setFilter] = useState('');
  const [liking, setLiking] = useState<string | null>(null);
  const activeVideo = useMixtapePlayerStore(state => state.video?.videoId);
  const play = useMixtapePlayerStore(state => state.play);
  const load = useCallback(async (signal?: AbortSignal) => {
    const version = ++requestVersion.current;
    try { const response = await getMixtape(signal); if (mounted.current && version === requestVersion.current) { setData(response); setError(''); } }
    catch (caught) { if (mounted.current && !signal?.aborted && version === requestVersion.current) setError(caught instanceof Error ? caught.message : 'Could not load the mixtape.'); }
    finally { if (mounted.current && !signal?.aborted && version === requestVersion.current) setLoading(false); }
  }, []);
  useEffect(() => {
    if (preview) return;
    mounted.current = true;
    const request = new AbortController();
    void Promise.resolve().then(() => { if (!request.signal.aborted) void load(request.signal); });
    const refresh = () => { if (!document.hidden) void load(request.signal); };
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    return () => { mounted.current = false; request.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [load, preview]);
  useGSAP(() => {
    if (preview || isPageTransitioning()) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' } })
        .from('.mixtape-heading-copy > *', { y: 16, opacity: 0, stagger: 0.07 }, 0)
        .from('.mixtape-cover', { y: 10, opacity: 0 }, 0.1);
    }, root);
    return () => media.revert();
  }, { scope: root, dependencies: [preview], revertOnUpdate: true });
  const tracks = [...data.tracks].filter(track => `${track.title} ${track.artist} ${track.nickname}`.toLowerCase().includes(filter.trim().toLowerCase())).sort((a, b) => sort === 'liked' ? b.likes - a.likes || b.createdAt.localeCompare(a.createdAt) : b.createdAt.localeCompare(a.createdAt));
  const like = async (track: MixtapeTrack) => {
    if (liking) return;
    setLiking(track.id); setNotice('');
    ++requestVersion.current;
    try { const response = await submitMixtape({ action: 'like', trackId: track.id }); if (mounted.current) { ++requestVersion.current; setData(response); } }
    catch (caught) { if (mounted.current) setNotice(caught instanceof Error ? caught.message : 'Could not update the like.'); }
    finally { if (mounted.current) setLiking(null); }
  };
  const added = (response: MixtapeResponse) => { ++requestVersion.current; setData(response); setError(''); setNotice('Your track is on the mixtape. Thanks for leaving something to listen to.'); };
  const Heading = preview ? 'h2' : 'h1';
  return <div ref={root} className={preview ? 'mixtape-preview-ui' : 'page mixtape-page'}>
    <header className="mixtape-heading"><div className="mixtape-heading-copy"><p className="mixtape-eyebrow"><ListMusic size={14} aria-hidden="true" />Made by the visitors</p><Heading className="mixtape-title">Visitor Mixtape<span>.</span></Heading><p>Leave a track. Find something new.</p><div className="mixtape-heading-actions"><button type="button" className="mixtape-primary" onClick={() => setAddOpen(true)} aria-haspopup="dialog" aria-controls="mixtape-add-track"><Plus size={17} aria-hidden="true" />Add a track</button><span>{data.tracks.length} {data.tracks.length === 1 ? 'track' : 'tracks'}<i aria-hidden="true" />One shared playlist</span></div></div><div className="mixtape-cover" aria-hidden="true"><div className="mixtape-cover-art" data-count={Math.min(data.tracks.length, 4)}>{data.tracks.length ? data.tracks.slice(0, 4).map(track => <img key={track.id} src={trackArtwork(track.videoId)} alt="" width="240" height="240" />) : <div className="mixtape-cover-empty"><span>V<span>/</span>M</span><i /></div>}</div><div className="mixtape-cover-caption"><span>Community playlist</span><span>{String(data.tracks.length).padStart(2, '0')} tracks</span></div></div></header>
    <div className="mixtape-toolbar"><div role="group" aria-label="Sort the mixtape"><button type="button" aria-pressed={sort === 'latest'} onClick={() => setSort('latest')}>Latest additions</button><button type="button" aria-pressed={sort === 'liked'} onClick={() => setSort('liked')}>Most liked</button></div><label className="mixtape-filter"><Search size={16} aria-hidden="true" /><span className="sr-only">Find a track in the mixtape</span><input type="search" placeholder="Find a track…" value={filter} onChange={event => setFilter(event.target.value)} /></label><button type="button" className="mixtape-icon-button" aria-label="Refresh mixtape" onClick={() => void load()}><RefreshCw size={16} /></button></div>
    {notice && <p className="mixtape-notice" role="status">{notice}</p>}
    {error && <div className="mixtape-error" role="alert"><p>{error}</p><button type="button" onClick={() => void load()}>Try again</button></div>}
    {loading ? <div className="mixtape-empty" role="status"><LoaderCircle size={28} className="mixtape-loading-icon" aria-hidden="true" /><p>Loading the mixtape…</p></div> : !error && tracks.length === 0 ? <div className="mixtape-empty"><CassetteTape size={48} strokeWidth={1.2} aria-hidden="true" /><h2>{filter ? 'No matching tracks.' : 'Every mixtape starts with one track.'}</h2><p>{filter ? 'Try another title, artist, or contributor.' : 'Add a favorite and leave a little of your taste here.'}</p>{!filter && <button type="button" className="mixtape-primary" onClick={() => setAddOpen(true)} aria-haspopup="dialog" aria-controls="mixtape-add-track"><Plus size={16} aria-hidden="true" />Leave the first track</button>}</div> : <>
      <div className="mixtape-list-heading" aria-hidden="true"><span>#</span><span>TRACK / CHANNEL</span><span>ADDED BY</span><span>LIKES</span></div>
      <ol className="mixtape-tracklist" aria-label="Community playlist">{tracks.map((track, index) => <li key={track.id} data-active={activeVideo === track.videoId}><button type="button" className="mixtape-track-play" aria-label={`Play ${track.title}`} onClick={() => play(track, tracks)}><span>{String(index + 1).padStart(2, '0')}</span><Play size={13} fill="currentColor" aria-hidden="true" /></button><button type="button" className="mixtape-track-title" onClick={() => play(track, tracks)} aria-label={`Play ${track.title} by ${track.artist}`}><img src={trackArtwork(track.videoId)} alt="" width="64" height="44" loading="lazy" /><span><strong>{track.title}</strong><small>{track.artist}</small></span></button><span className="mixtape-contributor">{track.nickname}</span><button type="button" className="mixtape-like" aria-label={`${track.liked ? 'Unlike' : 'Like'} ${track.title}`} aria-pressed={track.liked} disabled={Boolean(liking)} onClick={() => void like(track)}><Heart size={16} fill={track.liked ? 'currentColor' : 'none'} aria-hidden="true" /><span>{track.likes}</span></button></li>)}</ol>
    </>}
    <footer className="mixtape-footer"><span>A little collection of everyone who passed through.</span><span>Playback via YouTube</span></footer>
    <MixtapeAddTrack open={addOpen} searchEnabled={data.searchEnabled} close={() => setAddOpen(false)} onAdded={added} />
  </div>;
}

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Check, LoaderCircle, Play, Plus, Search, X } from 'lucide-react';
import type { MixtapeResponse, MixtapeVideo } from '../../types/mixtape';
import { searchMixtape, submitMixtape, trackArtwork } from '../../utils/mixtapeApi';
import { useModalMorph } from '../../hooks/useModalMorph';
import { useMixtapePlayerStore } from '../../store/mixtapePlayerStore';

export function MixtapeAddTrack({ open, searchEnabled, close, onAdded }: { open: boolean; searchEnabled: boolean; close: () => void; onAdded: (response: MixtapeResponse) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MixtapeVideo[]>([]);
  const [selected, setSelected] = useState<MixtapeVideo | null>(null);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const play = useMixtapePlayerStore(state => state.play);
  useModalMorph(dialog, open);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (!open) controller.current?.abort(); }, [open]);

  const search = async (event: FormEvent) => {
    event.preventDefault(); if (query.trim().length < 2) return;
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    setBusy(true); setError(''); setSearched(false);
    try { const response = await searchMixtape(query.trim(), request.signal); if (!request.signal.aborted && mounted.current) { setResults(response.results); setSearched(true); } }
    catch (caught) { if (!request.signal.aborted) setError(caught instanceof Error ? caught.message : 'Could not find that track.'); }
    finally { if (!request.signal.aborted && mounted.current) setBusy(false); }
  };
  const add = async (event: FormEvent) => {
    event.preventDefault(); if (!selected || saving) return;
    setSaving(true); setError('');
    try {
      const response = await submitMixtape({ action: 'add', videoId: selected.videoId, nickname: nickname.trim() });
      if (mounted.current) { onAdded(response); setSelected(null); setQuery(''); setResults([]); setSearched(false); close(); }
    } catch (caught) { if (mounted.current) setError(caught instanceof Error ? caught.message : 'Could not add the track.'); }
    finally { if (mounted.current) setSaving(false); }
  };
  const dismiss = () => { if (!saving) { controller.current?.abort(); setBusy(false); setError(''); setSelected(null); close(); } };

  return <dialog ref={dialog} id="mixtape-add-track" className="mixtape-add-dialog" aria-labelledby="mixtape-add-title" onCancel={event => { event.preventDefault(); dismiss(); }} onClose={() => { if (!dialog.current?.open) close(); }}>
    <div className="mixtape-add-surface modal-morph-surface">
      <header><div><p className="mixtape-eyebrow">A track from you</p><h2 id="mixtape-add-title">Add to the mixtape<span>.</span></h2></div><button type="button" className="mixtape-icon-button" onClick={dismiss} disabled={saving} aria-label="Close add track"><X size={20} /></button></header>
      {!selected ? <>
        <form className="mixtape-search-form" onSubmit={search}><label htmlFor="mixtape-song-query">{searchEnabled ? 'Search a song, artist, or paste a YouTube link' : 'Paste a YouTube video link'}</label><div><Search size={17} aria-hidden="true" /><input id="mixtape-song-query" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={searchEnabled ? 'What’s on repeat?' : 'https://www.youtube.com/watch?v=…'} maxLength={300} required autoFocus /><button type="submit" disabled={busy || query.trim().length < 2}>{busy ? <LoaderCircle size={16} className="mixtape-loading-icon" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}<span className="sr-only">Find track</span></button></div></form>
        <a className="mixtape-find-youtube" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query || 'music')}`} target="_blank" rel="noopener noreferrer">Find a song on YouTube<ArrowUpRight size={13} aria-hidden="true" /></a>
        {busy && <p className="mixtape-form-note" role="status">Finding your track…</p>}
        {searched && !results.length && <p className="mixtape-form-note" role="status">No tracks found. Try another song or paste its YouTube link.</p>}
        <ul className="mixtape-search-results">{results.map(video => <li key={video.videoId}><img src={trackArtwork(video.videoId)} alt="" width="64" height="44" /><div><strong>{video.title}</strong><span>{video.artist}</span></div><button type="button" className="mixtape-icon-button" aria-label={`Choose ${video.title}`} onClick={() => { setSelected(video); setError(''); }}><Plus size={18} /></button></li>)}</ul>
      </> : <form onSubmit={add}>
        <button type="button" className="mixtape-back" onClick={() => { setSelected(null); setError(''); }} disabled={saving}><ArrowLeft size={13} aria-hidden="true" />Choose another track</button>
        <div className="mixtape-selected-track"><img src={trackArtwork(selected.videoId)} alt="" width="160" height="90" /><div><strong>{selected.title}</strong><span>{selected.artist}</span><button type="button" onClick={() => { play(selected); close(); }}><Play size={12} fill="currentColor" aria-hidden="true" />Preview track</button></div></div>
        <label className="mixtape-nickname" htmlFor="mixtape-nickname">Your nickname <span>(optional)</span><input id="mixtape-nickname" value={nickname} onChange={event => setNickname(event.target.value)} placeholder="A visitor" maxLength={40} autoComplete="nickname" disabled={saving} /></label>
        <p className="mixtape-form-note">Your nickname and track will appear on the shared playlist. Keep it friendly. Up to three additions per hour.</p>
        <button type="submit" className="mixtape-primary" disabled={saving}>{saving ? <LoaderCircle size={16} className="mixtape-loading-icon" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{saving ? 'Adding your track…' : 'Add to mixtape'}</button>
      </form>}
      {error && <p className="mixtape-error" role="alert">{error}</p>}
    </div>
  </dialog>;
}

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, ListMusic, SkipBack, SkipForward, X } from 'lucide-react';
import { useMixtapePlayerStore } from '../../store/mixtapePlayerStore';
import { useNavStore } from '../../store';
import { loadYouTubePlayer } from '../../utils/youtubePlayer';
import type { YouTubePlayerInstance } from '../../utils/youtubePlayer';
import '../../styles/mixtape.css';

export function MixtapePlayer() {
  const { video, queue, next, previous, stop } = useMixtapePlayerStore();
  const navigate = useNavStore(state => state.navigate);
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState({ id: '', text: 'Loading player…' });
  const index = queue.findIndex(item => item.videoId === video?.videoId);
  const id = video?.videoId;

  useEffect(() => {
    if (!id || !host.current) return;
    const updateStatus = (text: string) => setStatus({ id, text });
    const container = host.current;
    let disposed = false;
    let player: YouTubePlayerInstance | undefined;
    void loadYouTubePlayer().then(api => {
      if (disposed) return;
      const anchor = document.createElement('div'); container.appendChild(anchor);
      player = new api.Player(anchor, {
        width: '100%', height: '200', videoId: id, host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, playsinline: 1, origin: window.location.origin, rel: 0 },
        events: {
          onReady: event => { if (!disposed) { updateStatus('Press play if playback does not start.'); event.target.playVideo(); } },
          onStateChange: event => {
            if (disposed) return;
            if (event.data === 1) updateStatus('Playing');
            if (event.data === 2) updateStatus('Paused');
            if (event.data === 0) { updateStatus('Finished'); useMixtapePlayerStore.getState().next(); }
          },
          onError: () => { if (!disposed) updateStatus('This track cannot play here. Try the YouTube link below.'); },
        },
      });
    }).catch(() => { if (!disposed) updateStatus('Could not load the player. Try the YouTube link below.'); });
    return () => { disposed = true; player?.destroy(); container.replaceChildren(); };
  }, [id]);

  if (!video) return null;
  return <aside className="mixtape-floating-player" aria-label="Visitor Mixtape player">
    <header><button type="button" className="mixtape-player-title" onClick={() => navigate('mixtape')}><ListMusic size={15} aria-hidden="true" /><span>Visitor Mixtape</span></button><button type="button" className="mixtape-icon-button" onClick={stop} aria-label="Stop playback and close player"><X size={18} /></button></header>
    <div className="mixtape-player-video" ref={host} />
    <div className="mixtape-player-caption"><strong>{video.title}</strong><span>{video.artist}</span></div>
    <div className="mixtape-player-actions"><button type="button" className="mixtape-icon-button" onClick={previous} disabled={index <= 0} aria-label="Previous track"><SkipBack size={16} /></button><span role="status" key={id}>{status.id === id ? status.text : 'Loading player…'}</span><button type="button" className="mixtape-icon-button" onClick={next} disabled={index < 0 || index >= queue.length - 1} aria-label="Next track"><SkipForward size={16} /></button></div>
    <a className="mixtape-youtube-link" href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">Open on YouTube<ExternalLink size={11} aria-hidden="true" /></a>
  </aside>;
}

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, ListMusic, RefreshCw, SkipBack, SkipForward, X } from 'lucide-react';
import { useMixtapePlayerStore } from '../../store/mixtapePlayerStore';
import { useNavStore } from '../../store';
import { createYouTubeFrame, loadYouTubePlayer, youtubePlaybackError } from '../../utils/youtubePlayer';
import type { YouTubePlayerInstance } from '../../utils/youtubePlayer';
import { applyPlayerMute, bindPlayerMute } from '../../utils/playerMute';
import { useSoundStore } from '../../store/soundStore';
import '../../styles/mixtape.css';

export function MixtapePlayer() {
  const { video, queue, next, previous, stop } = useMixtapePlayerStore();
  const navigate = useNavStore(state => state.navigate);
  const muted = useSoundStore(state => state.muted || !state.musicOptedIn);
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState({ id: '', text: 'Loading player…', failed: false });
  const [attempt, setAttempt] = useState(0);
  const index = queue.findIndex(item => item.videoId === video?.videoId);
  const id = video?.videoId;
  const title = video?.title;
  const token = `${id}:${attempt}`;

  useEffect(() => {
    if (!id || !host.current) return;
    const updateStatus = (text: string, failed = false) => setStatus({ id: token, text, failed });
    const container = host.current;
    let disposed = false;
    let player: YouTubePlayerInstance | undefined;
    let releaseMute: (() => void) | undefined;
    void loadYouTubePlayer().then(api => {
      if (disposed) return;
      const frame = createYouTubeFrame(id, title ?? 'Visitor Mixtape', window.location.origin);
      container.appendChild(frame);
      player = new api.Player(frame, {
        width: '100%', height: '200', videoId: id, host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 0, playsinline: 1, origin: window.location.origin, rel: 0 },
        events: {
          onReady: event => { if (!disposed) { releaseMute?.(); releaseMute = bindPlayerMute(event.target); updateStatus('Press play if playback does not start.'); event.target.playVideo(); } },
          onStateChange: event => {
            if (disposed) return;
            if (event.data === 1) { applyPlayerMute(event.target); updateStatus('Playing'); }
            if (event.data === 2) updateStatus('Paused');
            if (event.data === 0) { updateStatus('Finished'); useMixtapePlayerStore.getState().next(); }
          },
          onError: event => { if (!disposed) updateStatus(youtubePlaybackError(event.data), true); },
          onAutoplayBlocked: () => { if (!disposed) updateStatus('Your browser paused autoplay. Press play inside the video.'); },
        },
      });
    }).catch(() => { if (!disposed) updateStatus('Could not load the player. Retry or open the YouTube link below.', true); });
    return () => { disposed = true; releaseMute?.(); player?.destroy(); container.replaceChildren(); };
  }, [id, title, token]);

  if (!video) return null;
  return <aside className="mixtape-floating-player" aria-label="Visitor Mixtape player">
    <header><button type="button" className="mixtape-player-title" onClick={() => navigate('mixtape')}><ListMusic size={15} aria-hidden="true" /><span>Visitor Mixtape</span></button><button type="button" className="mixtape-icon-button" onClick={stop} aria-label="Stop playback and close player"><X size={18} /></button></header>
    <div className="mixtape-player-video" ref={host} />
    <div className="mixtape-player-caption"><strong>{video.title}</strong><span>{video.artist}</span></div>
    <div className="mixtape-player-actions"><button type="button" className="mixtape-icon-button" onClick={previous} disabled={index <= 0} aria-label="Previous track"><SkipBack size={16} /></button><span role="status" key={token}>{status.id === token ? muted && !status.failed ? 'Muted · unmute with the speaker button above.' : status.text : 'Loading player…'}</span><button type="button" className="mixtape-icon-button" onClick={next} disabled={index < 0 || index >= queue.length - 1} aria-label="Next track"><SkipForward size={16} /></button></div>
    {status.id === token && status.failed && <button type="button" className="mixtape-player-retry" onClick={() => setAttempt(value => value + 1)}><RefreshCw size={12} aria-hidden="true" />Retry player</button>}
    <a className="mixtape-youtube-link" href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">Open on YouTube<ExternalLink size={11} aria-hidden="true" /></a>
  </aside>;
}

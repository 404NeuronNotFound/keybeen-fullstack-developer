import { usePlayerStore }    from '../../store';
import { ProgressBar }       from '../../components/ui';
import { progressToTime }    from '../../utils';

export function Playbar() {
  const isPlaying     = usePlayerStore((s) => s.isPlaying);
  const currentTrack  = usePlayerStore((s) => s.currentTrack);
  const progress      = usePlayerStore((s) => s.progress);
  const volume        = usePlayerStore((s) => s.volume);
  const liked         = usePlayerStore((s) => s.liked);
  const shuffled      = usePlayerStore((s) => s.shuffled);
  const repeated      = usePlayerStore((s) => s.repeated);
  const toggle        = usePlayerStore((s) => s.toggle);
  const skipForward   = usePlayerStore((s) => s.skipForward);
  const skipBack      = usePlayerStore((s) => s.skipBack);
  const seek          = usePlayerStore((s) => s.seek);
  const setVolume     = usePlayerStore((s) => s.setVolume);
  const toggleLike    = usePlayerStore((s) => s.toggleLike);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat  = usePlayerStore((s) => s.toggleRepeat);

  const isLiked     = liked.has(currentTrack.id);
  const currentTime = progressToTime(progress, currentTrack.duration);

  return (
    <div style={{ height: 'var(--playbar-h)', background: 'var(--sp-dark2)', borderTop: '1px solid var(--sp-dark3)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>

      {/* track info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 220, minWidth: 0 }}>
        <div className={`grad-${currentTrack.gradient}`} style={{ width: 54, height: 54, borderRadius: 'var(--radius-sm)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{currentTrack.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sp-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.title}</div>
          <div style={{ fontSize: 11, color: 'var(--sp-gray)' }}>Full-Stack Dev</div>
        </div>
        <button onClick={() => toggleLike(currentTrack.id)} aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isLiked ? 'var(--sp-green)' : 'var(--sp-gray)', transition: 'color .15s, transform .15s', transform: isLiked ? 'scale(1.2)' : 'scale(1)', padding: '2px', flexShrink: 0 }}>
          {isLiked ? '♥' : '♡'}
        </button>
      </div>

      {/* controls + progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={toggleShuffle} aria-label="Shuffle"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffled ? 'var(--sp-green)' : 'var(--sp-gray)', fontSize: 18, position: 'relative' }}>
            ⇄{shuffled && <span style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--sp-green)', display: 'block' }} />}
          </button>

          <button onClick={skipBack} aria-label="Previous"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-gray)', fontSize: 22, transition: 'color .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sp-white)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sp-gray)'; }}>⏮</button>

          <button onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sp-white)', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .1s, background .15s', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = '#f0f0f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--sp-white)'; }}>
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button onClick={skipForward} aria-label="Next"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sp-gray)', fontSize: 22, transition: 'color .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sp-white)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sp-gray)'; }}>⏭</button>

          <button onClick={toggleRepeat} aria-label="Repeat"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeated ? 'var(--sp-green)' : 'var(--sp-gray)', fontSize: 18, position: 'relative' }}>
            ↺{repeated && <span style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: 'var(--sp-green)', display: 'block' }} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 480 }}>
          <span style={{ fontSize: 11, color: 'var(--sp-gray)', width: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{currentTime}</span>
          <div style={{ flex: 1 }}><ProgressBar value={progress} onChange={seek} /></div>
          <span style={{ fontSize: 11, color: 'var(--sp-gray)', width: 34, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{currentTrack.duration}</span>
        </div>
      </div>

      {/* volume */}
      <div style={{ width: 160, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 14, color: 'var(--sp-gray)' }}>🔊</span>
        <div style={{ width: 90 }}><ProgressBar value={volume} onChange={setVolume} accent="var(--sp-gray)" height={3} /></div>
      </div>

    </div>
  );
}

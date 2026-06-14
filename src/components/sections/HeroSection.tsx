import { usePlayerStore, useNavStore } from '../../store';
import { Button, Avatar }              from '../../components/ui';
import { SITE }                        from '../../constants';

export function HeroSection() {
  const isPlaying    = usePlayerStore((s) => s.isPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play         = usePlayerStore((s) => s.play);
  const navigate     = useNavStore((s) => s.navigate);

  return (
    <div
      style={{
        padding:    '48px 32px 36px',
        background: 'linear-gradient(180deg, rgba(29,185,84,.28) 0%, var(--sp-dark) 100%)',
      }}
    >
      {/* ── Spotify-style artist layout: photo left, info right ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'flex-end',
          gap:        32,
          marginBottom: 28,
          flexWrap:   'wrap',
        }}
      >
        {/* ── Artist photo ── */}
        <div
          style={{
            boxShadow: '0 16px 48px rgba(0,0,0,.6)',
            border:    '2px solid rgba(255,255,255,.08)',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        >
          <Avatar size={180} alt={`${SITE.fullName} photo`} />
        </div>

        {/* ── Text info ── */}
        <div style={{ flex: 1, minWidth: 240 }}>
          {/* verified badge — just like Spotify */}
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width:          18,
                height:         18,
                background:     'var(--sp-green)',
                borderRadius:   '50%',
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       10,
                color:          '#000',
                fontWeight:     900,
                flexShrink:     0,
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color:         'var(--sp-white)',
              }}
            >
              Verified Developer
            </span>
          </div>

          <h1
            style={{
              fontSize:      64,
              fontWeight:    900,
              letterSpacing: '-3px',
              color:         'var(--sp-white)',
              lineHeight:    1,
              marginBottom:  12,
            }}
          >
            {SITE.fullName}
          </h1>

          <p style={{ fontSize: 16, color: 'var(--sp-gray)', marginBottom: 0 }}>
            {SITE.tagline} · {SITE.location}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 28 }}>
        {SITE.stats.map(({ value, label }) => (
          <div key={label}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-white)', display: 'block' }}>
              {value}
            </span>
            <span style={{ fontSize: 12, color: 'var(--sp-gray)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── CTA buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          onClick={() => play(currentTrack)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            width:          54,
            height:         54,
            background:     'var(--sp-green)',
            border:         'none',
            borderRadius:   '50%',
            cursor:         'pointer',
            fontSize:       20,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            boxShadow:      '0 8px 24px rgba(29,185,84,.45)',
            transition:     'transform .12s, background .15s',
            flexShrink:     0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.background = 'var(--sp-green-h)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.background = 'var(--sp-green)'; }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <Button variant="outline" rounded onClick={() => navigate('contact')}>
          Get in touch
        </Button>
        <Button variant="outline" rounded onClick={() => navigate('projects')}>
          View projects
        </Button>
      </div>
    </div>
  );
}
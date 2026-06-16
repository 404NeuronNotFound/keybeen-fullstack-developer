import { useState } from 'react';
import { Play, Pause, BadgeCheck, Share2 } from 'lucide-react';
import { usePlayerStore, useNavStore } from '../../store';
import { Button, Avatar, ShareCardModal } from '../../components/ui';
import { useIsMobile }                 from '../../hooks';
import { SITE }                        from '../../constants';

export function HeroSection() {
  const isPlaying    = usePlayerStore((s) => s.isPlaying);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const play         = usePlayerStore((s) => s.play);
  const navigate     = useNavStore((s) => s.navigate);
  const isMobile     = useIsMobile();
  const [showCard, setShowCard] = useState(false);

  const avatarSize = isMobile ? 120 : 180;

  return (
    <div
      style={{
        padding:    isMobile ? '32px 16px 28px' : '48px 32px 36px',
        background: 'linear-gradient(180deg, rgba(29,185,84,.28) 0%, var(--sp-dark) 100%)',
      }}
    >
      {/* ── Spotify-style artist layout: photo left, info right ── */}
      <div
        style={{
          display:      'flex',
          alignItems:   isMobile ? 'center' : 'flex-end',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign:    isMobile ? 'center' : 'left',
          gap:          isMobile ? 16 : 32,
          marginBottom: 28,
          flexWrap:     'wrap',
        }}
      >
        {/* ── Artist photo ── */}
        <div
          style={{
            boxShadow:    '0 16px 48px rgba(0,0,0,.6)',
            border:       '2px solid rgba(255,255,255,.08)',
            borderRadius: '50%',
            flexShrink:   0,
          }}
        >
          <Avatar size={avatarSize} alt={`${SITE.fullName} photo`} />
        </div>

        {/* ── Text info ── */}
        <div style={{ flex: 1, minWidth: isMobile ? '100%' : 240 }}>
          {/* verified badge — just like Spotify */}
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              gap:            6,
              marginBottom:   10,
            }}
          >
            <BadgeCheck size={18} fill="var(--sp-green)" color="#000" />
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
              fontSize:      'clamp(36px, 9vw, 64px)',
              fontWeight:    900,
              letterSpacing: '-2px',
              color:         'var(--sp-white)',
              lineHeight:    1,
              marginBottom:  12,
            }}
          >
            {SITE.fullName}
          </h1>

          <p style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--sp-gray)', marginBottom: 0 }}>
            {SITE.tagline} · {SITE.location}
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display:        'flex',
          gap:             isMobile ? 24 : 32,
          marginBottom:    28,
          justifyContent:  isMobile ? 'center' : 'flex-start',
          textAlign:       isMobile ? 'center' : 'left',
        }}
      >
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
      <div
        style={{
          display:        'flex',
          alignItems:      'center',
          justifyContent:  isMobile ? 'center' : 'flex-start',
          gap:             16,
          flexWrap:        'wrap',
        }}
      >
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
          {isPlaying
            ? <Pause size={22} fill="#000" color="#000" />
            : <Play size={22} fill="#000" color="#000" style={{ marginLeft: 2 }} />}
        </button>

        <Button variant="outline" rounded onClick={() => navigate('contact')}>
          Get in touch
        </Button>
        <Button variant="outline" rounded onClick={() => navigate('projects')}>
          View projects
        </Button>

        {/* ── Share profile button ── */}
        <button
          onClick={() => setShowCard(true)}
          aria-label="Share profile"
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 24, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.05)', color: 'var(--sp-gray)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = 'var(--sp-white)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'var(--sp-gray)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* ── Share card modal ── */}
      {showCard && <ShareCardModal onClose={() => setShowCard(false)} />}
    </div>
  );
}
import { useRef, useState } from 'react';
import { BookOpen, BadgeCheck, Share2 } from 'lucide-react';
import { useProjectReaderStore, useNavStore } from '../../store';
import { Button, ShareCardModal } from '../../components/ui';
import { AvatarWithNote }              from '../../components/ui/AvatarWithNote';
import { useIsMobile }                 from '../../hooks';
import { SITE }                        from '../../constants';

export function HeroSection() {
  const openProject  = useProjectReaderStore((s) => s.openProject);
  const navigate     = useNavStore((s) => s.navigate);
  const isMobile     = useIsMobile();
  const [showCard, setShowCard] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const avatarSize = isMobile ? 120 : 180;

  return (
    <div
      className="page-x"
      style={{
        paddingTop: isMobile ? 32 : 48,
        paddingBottom: isMobile ? 28 : 36,
        background: 'linear-gradient(180deg, var(--sp-hero-tint) 0%, var(--sp-dark) 100%)',
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
            boxShadow:    'var(--sp-modal-shadow)',
            border:       '2px solid var(--sp-line)',
            borderRadius: '50%',
            flexShrink:   0,
          }}
        >
          <AvatarWithNote
            size={avatarSize}
            alt={`${SITE.fullName} photo`}
            
          />
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
            <BadgeCheck size={18} fill="var(--sp-green)" color="var(--sp-on-green)" />
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
          flexWrap:       'wrap',
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

      {/* Responsive project, contact, and share actions */}
      <div className="hero-actions">
        {/* project overview */}
        <button
          className="hero-primary-action"
          onClick={() => openProject()}
          aria-label="Open project overview"
          title="Read project overview"
          style={{ background: 'var(--sp-green)', color: 'var(--sp-on-green)', border: 'none', borderRadius: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--sp-accent-shadow)', transition: 'transform .12s, background .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.background = 'var(--sp-green-h)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--sp-green)'; }}
        >
          <BookOpen size={18} color="var(--sp-on-green)" style={{ flexShrink: 0 }} />
          <span>Read projects</span>
        </button>

        <Button variant="outline" rounded onClick={() => navigate('contact')}>Get in touch</Button>
        <Button variant="outline" rounded onClick={() => navigate('projects')}>View projects</Button>

        {/* share */}
        <button
          className="hero-share-action"
          ref={shareButtonRef}
          onClick={() => setShowCard(true)}
          aria-label="Share profile"
          aria-haspopup="dialog"
          aria-controls="share-profile-dialog"
          aria-expanded={showCard}
          style={{ display: 'flex', alignItems: 'center', gap: 7, borderRadius: 24, border: '1px solid var(--sp-line)', background: 'var(--sp-overlay)', color: 'var(--sp-gray)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sp-dark3)'; e.currentTarget.style.color = 'var(--sp-white)'; e.currentTarget.style.borderColor = 'var(--sp-gray2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sp-overlay)'; e.currentTarget.style.color = 'var(--sp-gray)'; e.currentTarget.style.borderColor = 'var(--sp-line)'; }}
        >
          <Share2 size={15} />
          <span className="hero-share-label">Share</span>
        </button>
      </div>

      {/* ── Share card modal ── */}
      {showCard && <ShareCardModal onClose={() => setShowCard(false)} returnFocusRef={shareButtonRef} />}
    </div>
  );
}

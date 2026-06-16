import { useRef, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Link, Check } from 'lucide-react';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import { Avatar } from '../../components/ui';
import { SITE }   from '../../constants';
import { skills } from '../../data';

// Top 6 skills by level for the card
const TOP_SKILLS = Object.values(skills)
  .flat()
  .sort((a, b) => b.level - a.level)
  .slice(0, 6)
  .map((s) => s.name);

// ── The actual card (also used for PNG export) ───────────────────────────
interface CardProps {
  /** when true the card uses absolute pixel sizing (for canvas export) */
  forExport?: boolean;
}

export function ShareCardInner({ forExport = false }: CardProps) {
  const scale = forExport ? 2 : 1;

  return (
    <div
      id="share-card-inner"
      style={{
        width:          forExport ? 480 * scale : '100%',
        background:     'linear-gradient(145deg, #121212 0%, #1a1a1a 60%, rgba(29,185,84,.08) 100%)',
        border:         '1px solid rgba(29,185,84,.25)',
        borderRadius:   forExport ? 0 : 16,
        padding:        32 * scale,
        fontFamily:     "'Inter', 'Helvetica Neue', sans-serif",
        color:          '#fff',
        position:       'relative',
        overflow:       'hidden',
        boxSizing:      'border-box',
      }}
    >
      {/* decorative green glow top-right */}
      <div style={{ position: 'absolute', top: -60 * scale, right: -60 * scale, width: 200 * scale, height: 200 * scale, borderRadius: '50%', background: 'rgba(29,185,84,.12)', pointerEvents: 'none' }} />

      {/* brand watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale, marginBottom: 24 * scale }}>
        <div style={{ width: 22 * scale, height: 22 * scale, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={12 * scale} height={12 * scale} viewBox="0 0 24 24" fill="none">
            <path d="M5 3l14 9-14 9V3z" fill="#000" />
          </svg>
        </div>
        <span style={{ fontSize: 12 * scale, fontWeight: 800, letterSpacing: 1, color: '#a7a7a7' }}>Keybeen</span>
      </div>

      {/* avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 * scale, marginBottom: 22 * scale }}>
        <div style={{ flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(29,185,84,.4)', width: 64 * scale, height: 64 * scale }}>
          <Avatar size={64 * scale} />
        </div>
        <div>
          <div style={{ fontSize: 22 * scale, fontWeight: 900, letterSpacing: -1, lineHeight: 1, marginBottom: 4 * scale }}>{SITE.fullName}</div>
          <div style={{ fontSize: 13 * scale, fontWeight: 600, color: '#1DB954', marginBottom: 4 * scale }}>{SITE.role}</div>
          <div style={{ fontSize: 11 * scale, color: '#a7a7a7' }}>{SITE.location}</div>
        </div>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 20 * scale }} />

      {/* top row: skills + QR */}
      <div style={{ display: 'flex', gap: 20 * scale, alignItems: 'flex-start', marginBottom: 20 * scale }}>
        {/* skill chips */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10 * scale, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#a7a7a7', marginBottom: 10 * scale }}>Top skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 * scale }}>
            {TOP_SKILLS.map((s) => (
              <span key={s} style={{ fontSize: 11 * scale, fontWeight: 600, padding: `${4 * scale}px ${10 * scale}px`, background: 'rgba(29,185,84,.12)', border: '1px solid rgba(29,185,84,.25)', borderRadius: 99, color: '#1DB954' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* QR code */}
        <div style={{ flexShrink: 0, background: '#fff', borderRadius: 8 * scale, padding: 8 * scale }}>
          <QRCodeSVG
            value={SITE.website}
            size={80 * scale}
            fgColor="#121212"
            bgColor="#ffffff"
            level="M"
          />
        </div>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 16 * scale }} />

      {/* footer: socials + website */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 * scale }}>
        <div style={{ display: 'flex', gap: 12 * scale, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 * scale, fontSize: 11 * scale, color: '#a7a7a7' }}>
            <FaGithub size={13 * scale} />
            @{SITE.githubUsername}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 * scale, fontSize: 11 * scale, color: '#a7a7a7' }}>
            <FaInstagram size={13 * scale} />
            @kxvxn.js
          </div>
        </div>
        <div style={{ fontSize: 12 * scale, fontWeight: 700, color: '#1DB954' }}>{SITE.website}</div>
      </div>
    </div>
  );
}

// ── Modal wrapper ────────────────────────────────────────────────────────
interface ShareCardModalProps {
  onClose: () => void;
}

export function ShareCardModal({ onClose }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SITE.website);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback: select input
    }
  }, []);

  const downloadPNG = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas');
    const node = document.getElementById('share-card-inner');
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    const link = document.createElement('a');
    link.download = 'keybeen-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position:             'fixed',
        inset:                0,
        background:           'rgba(0,0,0,.8)',
        backdropFilter:       'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex:               9999,
        overflowY:            'auto',
        WebkitOverflowScrolling: 'touch',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'center',
        padding:              '24px 16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, margin: 'auto' }}
      >
        {/* modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Share profile</h2>
            <p style={{ fontSize: 13, color: '#a7a7a7' }}>My developer card, share it or download as PNG</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a7a7a7', transition: 'background .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* card preview + actions — same container so buttons align to card edges */}
        <div style={{ width: '100%' }}>
          <div ref={cardRef} style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
            <ShareCardInner />
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
            <button
              onClick={copyLink}
              style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', background: copied ? 'rgba(29,185,84,.15)' : 'rgba(255,255,255,.06)', border: '1px solid', borderColor: copied ? 'var(--sp-green)' : 'rgba(255,255,255,.12)', borderRadius: 8, color: copied ? '#1DB954' : '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
              onMouseLeave={(e) => { if (!copied) e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
            >
              {copied ? <Check size={15} /> : <Link size={15} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>

            <button
              onClick={downloadPNG}
              style={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', background: '#1DB954', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1ed760'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1DB954'; }}
            >
              <Download size={15} />
              Download card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
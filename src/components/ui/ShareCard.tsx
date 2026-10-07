import { useRef, useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Link, Check } from 'lucide-react';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import { Avatar } from '../../components/ui';
import { SITE }   from '../../constants';
import { CORE_SKILL_NAMES } from '../../data/skills';
import { toast } from '../../store/toastStore';

const TOP_SKILLS = CORE_SKILL_NAMES;

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
        background:     'linear-gradient(145deg, var(--sp-dark) 0%, var(--sp-dark2) 60%, rgba(29,185,84,.08) 100%)',
        border:         '1px solid rgba(29,185,84,.25)',
        borderRadius:   forExport ? 0 : 16,
        padding:        forExport ? 32 * scale : 'clamp(16px, 4vw, 32px)',
        fontFamily:     "'Inter', 'Helvetica Neue', sans-serif",
        color:          'var(--sp-white)',
        position:       'relative',
        overflow:       'hidden',
        boxSizing:      'border-box',
      }}
    >
      {/* decorative green glow top-right */}
      <div style={{ position: 'absolute', top: -60 * scale, right: -60 * scale, width: 200 * scale, height: 200 * scale, borderRadius: '50%', background: 'rgba(29,185,84,.12)', pointerEvents: 'none' }} />

      {/* brand watermark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale, marginBottom: 24 * scale }}>
        <div style={{ width: 22 * scale, height: 22 * scale, borderRadius: '50%', background: 'var(--sp-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={12 * scale} height={12 * scale} viewBox="0 0 24 24" fill="none">
            <path d="M5 3l14 9-14 9V3z" fill="var(--sp-on-green)" />
          </svg>
        </div>
        <span style={{ fontSize: 12 * scale, fontWeight: 800, letterSpacing: 1, color: 'var(--sp-gray)' }}>Keybeen</span>
      </div>

      {/* avatar + name row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 * scale, marginBottom: 22 * scale }}>
        <div style={{ flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(29,185,84,.4)', width: 64 * scale, height: 64 * scale }}>
          <Avatar size={64 * scale} />
        </div>
        <div style={{ flex: `1 1 ${200 * scale}px`, minWidth: 0, overflowWrap: 'anywhere' }}>
          <div style={{ fontSize: 22 * scale, fontWeight: 900, letterSpacing: -1, lineHeight: 1, marginBottom: 4 * scale }}>{SITE.fullName}</div>
          <div style={{ fontSize: 13 * scale, fontWeight: 600, color: 'var(--sp-green)', marginBottom: 4 * scale }}>{SITE.role}</div>
          <div style={{ fontSize: 11 * scale, color: 'var(--sp-gray)' }}>{SITE.location}</div>
        </div>
      </div>

      {/* divider */}
      <div style={{ height: 1, background: 'var(--sp-overlay)', marginBottom: 20 * scale }} />

      {/* top row: skills + QR */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 * scale, alignItems: 'flex-start', marginBottom: 20 * scale }}>
        {/* skill chips */}
        <div style={{ flex: `1 1 ${150 * scale}px`, minWidth: 0 }}>
          <div style={{ fontSize: 10 * scale, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--sp-gray)', marginBottom: 10 * scale }}>Top skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 * scale }}>
            {TOP_SKILLS.map((s) => (
              <span key={s} style={{ fontSize: 11 * scale, fontWeight: 600, padding: `${4 * scale}px ${10 * scale}px`, background: 'rgba(29,185,84,.12)', border: '1px solid rgba(29,185,84,.25)', borderRadius: 99, color: 'var(--sp-green)', maxWidth: '100%', overflowWrap: 'anywhere' }}>
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
      <div style={{ height: 1, background: 'var(--sp-overlay)', marginBottom: 16 * scale }} />

      {/* footer: socials + website */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 * scale }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 * scale, alignItems: 'center', minWidth: 0, maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 * scale, fontSize: 11 * scale, color: 'var(--sp-gray)', minWidth: 0, overflowWrap: 'anywhere' }}>
            <FaGithub size={13 * scale} />
            @{SITE.githubUsername}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 * scale, fontSize: 11 * scale, color: 'var(--sp-gray)', minWidth: 0, overflowWrap: 'anywhere' }}>
            <FaInstagram size={13 * scale} />
            @{SITE.instagramUsername}
          </div>
        </div>
        <div style={{ fontSize: 12 * scale, fontWeight: 700, color: 'var(--sp-green)', minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere' }}>{SITE.website}</div>
      </div>
    </div>
  );
}

// ── Modal wrapper ────────────────────────────────────────────────────────
interface ShareCardModalProps {
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}

export function ShareCardModal({ onClose, returnFocusRef }: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = returnFocusRef?.current ?? document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SITE.website);
      setCopied(true);
      setFeedback('Profile link copied to your clipboard.');
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2200);
      toast.success({ title: 'Link copied!', description: 'Your clipboard has the profile link, ready to share.' });
    } catch {
      setFeedback("Couldn't copy the link. Please copy the website address from the card instead.");
      toast.error({ title: "Couldn't copy the link", description: 'Please copy the website address from the card instead.' });
    }
  }, []);

  const downloadPNG = useCallback(async () => {
    setFeedback('Preparing your card download…');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const node = cardRef.current;
      if (!node) throw new Error('Card preview unavailable');
      const canvas = await html2canvas(node, {
        backgroundColor: null,
        scale: 2,
        windowWidth: 1024,
        onclone: (_document, clonedCard) => {
          // Export a stable 480px layout regardless of the visitor's phone width.
          clonedCard.style.width = '480px';
          const inner = clonedCard.querySelector<HTMLElement>('#share-card-inner');
          if (inner) inner.style.padding = '32px';
        },
      });
      const link = document.createElement('a');
      link.download = 'keybeen-card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setFeedback('Your card download was requested. Check your browser’s downloads.');
      toast.success({ title: 'Your card is ready', description: 'The download was requested. Check your browser’s downloads.' });
    } catch {
      setFeedback("Couldn't create your card. Please try again, or copy the profile link to share it.");
      toast.error({ title: "Couldn't create your card", description: 'Please try again, or copy the profile link to share it.' });
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      id="share-profile-dialog"
      className="share-card-modal"
      aria-labelledby="share-dialog-title"
      aria-describedby="share-dialog-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={(event) => {
        // Strict Mode can queue a close event during cleanup, then reopen the
        // dialog before that event arrives. Only dismiss a still-closed dialog.
        if (!event.currentTarget.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <div
        style={{ width: '100%' }}
      >
        {/* modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            <h2 id="share-dialog-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 2 }}>Share profile</h2>
            <p id="share-dialog-description" style={{ fontSize: 13, color: 'var(--sp-gray)' }}>My developer card, share it or download as PNG</p>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close share dialog"
            className="icon-button"
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
          <div className="share-actions">
            <button
              type="button"
              onClick={copyLink}
              className="ui-button ui-button--outline share-action"
              data-copied={copied}
            >
              {copied ? <Check size={15} /> : <Link size={15} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>

            <button
              type="button"
              onClick={downloadPNG}
              className="ui-button ui-button--primary share-action"
            >
              <Download size={15} />
              Download card
            </button>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" style={{ fontSize: 13, color: 'var(--sp-gray)', lineHeight: 1.5, marginTop: feedback ? 12 : 0 }}>{feedback}</p>
        </div>
      </div>
    </dialog>
  );
}

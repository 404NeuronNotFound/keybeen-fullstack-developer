import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Lock, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { Project } from '../../types';

interface PopoverPosition {
  top:   number;
  left:  number;
  align: 'left' | 'right';
}

interface Props {
  project:  Project;
  locked?:  boolean;
  children: React.ReactNode;
  onPlay?:  (p: Project) => void;
}

const DELAY_MS  = 320; // ms before popover appears
const POPOVER_W = 260; // px

/** Calculates popover position relative to the card, keeping it inside viewport */
function calcPosition(card: HTMLElement): PopoverPosition {
  const rect  = card.getBoundingClientRect();
  const spaceR = window.innerWidth - rect.right;
  const align: 'left' | 'right' = spaceR >= POPOVER_W + 16 ? 'left' : 'right';
  return {
    top:  rect.bottom + window.scrollY + 8,
    left: align === 'left'
      ? rect.left  + window.scrollX
      : rect.right + window.scrollX - POPOVER_W,
    align,
  };
}

export function ProjectPopover({ project, locked = false, children, onPlay }: Props) {
  const [visible, setVisible]   = useState(false);
  const [pos,     setPos]       = useState<PopoverPosition | null>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (wrapRef.current) {
        setPos(calcPosition(wrapRef.current));
        setVisible(true);
      }
    }, DELAY_MS);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // Hide on scroll so the popover doesn't float in the wrong place
  useEffect(() => {
    const el = document.querySelector('main');
    if (!el) return;
    el.addEventListener('scroll', hide, { passive: true });
    return () => el.removeEventListener('scroll', hide);
  }, [hide]);

  return (
    <div
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: 'relative' }}
    >
      {children}

      {visible && pos && (
        <div
          className="popover-enter"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position:     'fixed',
            top:          pos.top,
            left:         pos.left,
            width:        POPOVER_W,
            background:   'var(--sp-dark2)',
            border:       '1px solid var(--sp-dark3)',
            borderRadius: 'var(--radius-md)',
            boxShadow:    '0 16px 48px rgba(0,0,0,.55)',
            zIndex:       9998,
            overflow:     'hidden',
          }}
        >
          {/* thumbnail header */}
          <div
            className={`grad-${project.gradient}`}
            style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, position: 'relative' }}
          >
            <img
              src={project.image}
              alt={project.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {locked && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <Lock size={20} color="rgba(255,255,255,.85)" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.75)', letterSpacing: '.5px', textTransform: 'uppercase' }}>Coming soon</span>
                </div>
              </div>
            )}
          </div>

          {/* content */}
          <div style={{ padding: '14px 14px 16px' }}>
            {/* action row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              {!locked && onPlay ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onPlay(project); }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sp-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .1s, background .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.background='var(--sp-green-h)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform='scale(1)';    e.currentTarget.style.background='var(--sp-green)'; }}
                >
                  <Play size={16} fill="#000" color="#000" style={{ marginLeft: 1 }} />
                </button>
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sp-dark3)', border: '1px solid var(--sp-dark4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={14} color="var(--sp-gray)" />
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--sp-gray)', display: 'flex', padding: 4, transition: 'color .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--sp-white)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--sp-gray)'; }}>
                  <FaGithub size={16} />
                </a>
                {!locked && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--sp-gray)', display: 'flex', padding: 4, transition: 'color .15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color='var(--sp-white)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color='var(--sp-gray)'; }}>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* title + year */}
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 2 }}>{project.title}</div>
            <div style={{ fontSize: 11, color: 'var(--sp-green)', fontWeight: 700, marginBottom: 8 }}>{project.year}</div>

            {/* description */}
            <p style={{ fontSize: 12, color: 'var(--sp-gray)', lineHeight: 1.6, marginBottom: 12 }}>{project.description}</p>

            {/* tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {project.tags.map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 3, background: 'var(--sp-dark3)', color: 'var(--sp-gray)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
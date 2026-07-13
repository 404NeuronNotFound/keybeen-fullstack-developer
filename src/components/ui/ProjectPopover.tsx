import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Lock, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { Project } from '../../types';

interface Props {
  project:  Project;
  locked?:  boolean;
  children: React.ReactNode;
  onPlay?:  (p: Project) => void;
}

interface PopoverPosition {
  top:   number;
  left:  number;
  above: boolean;
}

const DELAY_MS  = 280;
const POPOVER_W = 260;
const POPOVER_H = 330;
const GAP       = 12;

function calcPosition(card: HTMLElement): PopoverPosition {
  const rect = card.getBoundingClientRect();

  // center horizontally over card, clamp to viewport
  const idealLeft = rect.left + rect.width / 2 - POPOVER_W / 2;
  const left = Math.max(8, Math.min(idealLeft, window.innerWidth - POPOVER_W - 8));

  // prefer above card, fall back to below
  const above = rect.top >= POPOVER_H + GAP;
  const rawTop = above ? rect.top - POPOVER_H - GAP : rect.bottom + GAP;
  const top = Math.max(8, rawTop);

  return { top, left, above };
}

export function ProjectPopover({ project, locked = false, children, onPlay }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos,     setPos]     = useState<PopoverPosition | null>(null);
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

  // hide when main scrolls so popover never drifts
  useEffect(() => {
    const el = document.querySelector('main');
    if (!el) return;
    el.addEventListener('scroll', hide, { passive: true });
    return () => el.removeEventListener('scroll', hide);
  }, [hide]);

  return (
    <div ref={wrapRef} onMouseEnter={show} onMouseLeave={hide} style={{ position: 'relative' }}>
      {children}

      {visible && pos && (
        <div
          className="popover-enter"
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position:        'fixed',
            top:             pos.top,
            left:            pos.left,
            width:           POPOVER_W,
            background:      'var(--sp-dark2)',
            border:          '1px solid var(--sp-dark3)',
            borderRadius:    'var(--radius-md)',
            boxShadow:       '0 24px 64px rgba(0,0,0,.7)',
            zIndex:          9998,
            overflow:        'visible',
            transformOrigin: pos.above ? 'bottom center' : 'top center',
          }}
        >
          {/* border arrow */}
          <div style={{
            position:  'absolute',
            left:      '50%',
            transform: 'translateX(-50%)',
            width:     0,
            height:    0,
            ...(pos.above
              ? { bottom: -7, borderTop: '7px solid var(--sp-dark3)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' }
              : { top:    -7, borderBottom: '7px solid var(--sp-dark3)', borderLeft: '7px solid transparent', borderRight: '7px solid transparent' }),
          }} />
          {/* fill arrow */}
          <div style={{
            position:  'absolute',
            left:      '50%',
            transform: 'translateX(-50%)',
            width:     0,
            height:    0,
            zIndex:    1,
            ...(pos.above
              ? { bottom: -5, borderTop: '6px solid var(--sp-dark2)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' }
              : { top:    -5, borderBottom: '6px solid var(--sp-dark2)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' }),
          }} />

          {/* rounded inner clip */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

            {/* thumbnail */}
            <div className={`grad-${project.gradient}`} style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, position: 'relative' }}>
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
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
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
                    onClick={e => { e.stopPropagation(); onPlay(project); }}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sp-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .1s, background .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = 'var(--sp-green-h)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.background = 'var(--sp-green)'; }}>
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
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--sp-white)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--sp-gray)'; }}>
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
        </div>
      )}
    </div>
  );
}
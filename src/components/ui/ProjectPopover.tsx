import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { Project } from '../../types';
import { getProjectUrl } from '../../utils';
import { useProjectReaderStore } from '../../store';
import { ProjectCover } from './ProjectCover';

interface Props {
  project:  Project;
  children: React.ReactNode;
}

const DELAY_MS  = 280;
const CLOSE_DELAY_MS = 240;
const POPOVER_W = 260;
const GAP       = 12;

function positionPreview(card: HTMLElement, preview: HTMLElement) {
  const rect = card.getBoundingClientRect();
  const { width, height } = preview.getBoundingClientRect();
  const idealLeft = rect.left + rect.width / 2 - width / 2;
  const left = Math.max(8, Math.min(idealLeft, window.innerWidth - width - 8));
  const aboveSpace = rect.top - GAP - 8;
  const belowSpace = window.innerHeight - rect.bottom - GAP - 8;
  const above = aboveSpace >= height || (belowSpace < height && aboveSpace > belowSpace);
  const rawTop = above ? rect.top - height - GAP : rect.bottom + GAP;
  const top = Math.max(8, Math.min(rawTop, window.innerHeight - height - 8));
  preview.style.top = `${top}px`;
  preview.style.left = `${left}px`;
  preview.style.visibility = 'visible';
}

export function ProjectPopover({ project, children }: Props) {
  const openProject = useProjectReaderStore(state => state.openProject);
  const githubUrl = getProjectUrl(project.github);
  const liveUrl = getProjectUrl(project.live);
  const [visible, setVisible] = useState(false);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = useCallback(() => {
    if (openTimer.current !== null) clearTimeout(openTimer.current);
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    openTimer.current = closeTimer.current = null;
  }, []);

  const show = useCallback(() => {
    cancelTimers();
    if (visible) return;
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setVisible(true);
    }, DELAY_MS);
  }, [cancelTimers, visible]);

  const hide = useCallback(() => {
    cancelTimers();
    setVisible(false);
  }, [cancelTimers]);

  const scheduleHide = useCallback(() => {
    cancelTimers();
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      // Keep links available while a keyboard user is interacting with them.
      if (!previewRef.current?.contains(document.activeElement)) setVisible(false);
    }, CLOSE_DELAY_MS);
  }, [cancelTimers]);

  useEffect(() => cancelTimers, [cancelTimers]);

  useLayoutEffect(() => {
    if (!visible) return;
    const card = wrapRef.current;
    const preview = previewRef.current;
    if (!card || !preview) return;
    const reposition = () => positionPreview(card, preview);
    reposition();
    const observer = new ResizeObserver(reposition);
    observer.observe(preview);
    window.addEventListener('resize', reposition);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', reposition);
    };
  }, [visible]);

  // hide when main scrolls so popover never drifts
  useEffect(() => {
    const el = document.querySelector('main');
    el?.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      el?.removeEventListener('scroll', hide);
      window.removeEventListener('scroll', hide);
    };
  }, [hide]);

  return (
    <div ref={wrapRef} className="project-card-shell" onMouseEnter={show} onMouseLeave={scheduleHide} style={{ position: 'relative' }}>
      {children}

      {visible && createPortal(
        <div
          ref={previewRef}
          className="popover-enter"
          onMouseEnter={cancelTimers}
          onMouseLeave={scheduleHide}
          onFocus={cancelTimers}
          onBlur={scheduleHide}
          onKeyDown={e => { if (e.key === 'Escape') hide(); }}
          style={{
            position:        'fixed',
            visibility:      'hidden',
            width:           POPOVER_W,
            maxWidth:        'calc(100vw - 16px)',
            maxHeight:       'calc(100dvh - 16px)',
            background:      'var(--sp-dark2)',
            border:          '1px solid var(--sp-dark3)',
            borderRadius:    'var(--radius-md)',
            boxShadow:       'var(--sp-modal-shadow)',
            zIndex:          9998,
            overflow:        'auto',
          }}
        >

          {/* rounded inner clip */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

            <ProjectCover project={project} />

            {/* content */}
            <div style={{ padding: '14px 14px 16px' }}>
              {/* action row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <button className="project-icon-button" aria-label={'View details for ' + project.title} aria-haspopup="dialog" onClick={() => { hide(); openProject(project); }}><BookOpen size={18} /></button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`View repository for ${project.title}`}
                    className="icon-button">
                    <FaGithub size={16} />
                  </a>}
                  {liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open live website for ${project.title}`}
                      className="icon-button">
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
      , document.body)}
    </div>
  );
}

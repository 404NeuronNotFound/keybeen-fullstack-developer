import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ResponsiveImage } from './ResponsiveImage';
import type { CSSProperties } from 'react';
import type { Project } from '../../types';
import '../../styles/project-vinyl.css';

gsap.registerPlugin(useGSAP);

export function ProjectCover({ project, compact = false, vinyl = false }: { project: Project; compact?: boolean; vinyl?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!vinyl || !root.current) return;
    const artwork = root.current;
    const card = artwork.closest<HTMLElement>('.project-card');
    if (!card) return;
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', hover: '(hover: hover)' }, context => {
      const { motion, hover } = context.conditions!;
      const slide = gsap.timeline({ paused: true, defaults: { duration: 0.65, ease: 'power3.inOut' } })
        .to('.project-vinyl-disc', { xPercent: hover ? 26 : 7 }, 0)
        .to('.project-cover-print', { xPercent: hover ? -17.5676 : -10.8 }, 0);
      let visible = true;
      let active = false;
      const syncSpin = () => { artwork.dataset.spinning = String(Boolean(active && motion && visible && !document.hidden)); };
      const update = (event?: Event) => {
        const focused = event?.type === 'focusout' ? (event as FocusEvent).relatedTarget : document.activeElement;
        active = Boolean((hover && card.matches(':hover')) || (focused instanceof Node && card.contains(focused)));
        if (motion) { if (active) slide.play(); else slide.reverse(); }
        else slide.progress(active ? 1 : 0);
        syncSpin();
      };
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncSpin(); });
      observer.observe(artwork);
      for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) card.addEventListener(event, update);
      document.addEventListener('visibilitychange', syncSpin);
      update();
      return () => {
        observer.disconnect();
        for (const event of ['pointerenter', 'pointerleave', 'focusin', 'focusout']) card.removeEventListener(event, update);
        document.removeEventListener('visibilitychange', syncSpin);
        delete artwork.dataset.spinning;
      };
    });
    return () => media.revert();
  }, { scope: root, dependencies: [vinyl], revertOnUpdate: true });
  return (
    <div ref={root} className={`project-cover${compact ? ' project-cover-compact' : ''}${vinyl ? ' project-cover-vinyl' : ''}`} style={{ '--project-accent': project.accent } as CSSProperties} role="img" aria-label={`Cover art for ${project.shortTitle}`}>
      {vinyl && <div className="project-vinyl-disc" aria-hidden="true"><div className="project-vinyl-spin"><span className="project-vinyl-label"><span>{project.shortTitle}</span><i /></span></div><div className="project-vinyl-sheen" /></div>}
      <div className="project-cover-print" aria-hidden="true">
        {project.image && failedSrc !== project.image ? <ResponsiveImage src={project.image} alt="" sizes={compact ? '40px' : '(max-width: 768px) 50vw, 320px'} onError={() => setFailedSrc(project.image ?? '')} /> : (
          <svg viewBox="0 0 160 160" fill="none">
            {project.id === 3 ? <><path d="M24 124h112M36 124V90h18v34M70 124V66h18v58M104 124V38h18v86" /><path d="m26 62 38-22 27 9 42-29" /></> : project.id === 5 ? <><rect x="28" y="24" width="104" height="112" rx="8" /><path d="M48 52h20m16 0h28M48 76h20m16 0h28M48 100h20m16 0h28M80 40v76" /></> : <><circle cx="80" cy="80" r="54" /><path d="m54 80 18 18 36-40M80 12v12m0 112v12M12 80h12m112 0h12" /></>}
          </svg>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ResponsiveImage } from './ResponsiveImage';
import type { CSSProperties } from 'react';
import type { Project } from '../../types';

export function ProjectCover({ project, compact = false }: { project: Project; compact?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return (
    <div className={`project-cover${compact ? ' project-cover-compact' : ''}`} style={{ '--project-accent': project.accent } as CSSProperties} role="img" aria-label={`Cover art for ${project.shortTitle}`}>
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

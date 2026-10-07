import { motion, useReducedMotion } from 'framer-motion';
import { ProjectPopover } from './ProjectPopover';
import { ProjectCover } from './ProjectCover';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { SaveProjectButton } from './SaveProjectButton';
import type { Project } from '../../types';
import { useHoverSound } from '../../hooks/useHoverSound';
import { useProjectReaderStore } from '../../store';

export function TeaserCard({ project }: { project: Project }) {
  const reducedMotion = useReducedMotion();
  const { play: playSound } = useHoverSound();
  const openProject = useProjectReaderStore((s) => s.openProject);
  const setSection = useProjectReaderStore((s) => s.setSection);

  return (
    <ProjectPopover project={project}>
      <motion.div
        className="project-card surface-card"
        onMouseEnter={() => playSound('hover')}
        initial={false}
        whileHover={reducedMotion ? undefined : { y: -2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="project-card-art"><ProjectCover project={project} /></div>
        <div className="project-card-title">{project.shortTitle}</div>
        <p className="project-card-subtitle">{project.subtitle}</p>
        <div className="project-card-meta"><ProjectStatusBadge status={project.status} /><SaveProjectButton project={project} /></div>
        <button type="button" className="project-reader-button project-details-button" aria-label={`View ${project.caseStudy ? 'case study' : 'details'} for ${project.title}`} aria-haspopup="dialog" aria-controls="project-overview" onClick={() => { openProject(project); if (project.caseStudy) setSection(1); }}>{project.caseStudy ? 'View case study' : 'View details'}</button>
      </motion.div>
    </ProjectPopover>
  );
}

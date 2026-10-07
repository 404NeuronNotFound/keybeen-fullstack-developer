import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Tag } from './Tag';
import { ProjectPopover } from './ProjectPopover';
import type { Project } from '../../types';
import { useHoverSound } from '../../hooks/useHoverSound';
import { useProjectReaderStore } from '../../store';

export function TeaserCard({ project }: { project: Project }) {
  const { play: playSound } = useHoverSound();
  const openProject = useProjectReaderStore((s) => s.openProject);

  return (
    <ProjectPopover project={project} locked>
      <motion.div
        className="project-card"
        onMouseEnter={() => playSound('hover')}
        initial={false}
        whileHover={{ y: -2, opacity: 0.8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{ background: 'var(--sp-dark2)', borderRadius: 'var(--radius-md)', padding: 16, position: 'relative', opacity: 0.65 }}
      >
        <div className={`grad-${project.gradient}`} style={{ width: '100%', paddingBottom: '100%', borderRadius: 'var(--radius-sm)', position: 'relative', marginBottom: 14, overflow: 'hidden', filter: 'grayscale(0.4)' }}>
          <img src={project.image} alt={project.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, background: 'rgba(0,0,0,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <Lock size={14} color="rgba(255,255,255,.85)" />
          </div>
        </div>
        <div className="project-card-title" style={{ color: 'var(--sp-white)' }}>{project.shortTitle}</div>
        <p className="project-card-subtitle">{project.subtitle}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Tag>Coming soon</Tag></div>
        <div className="project-card-tags" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{project.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        <button type="button" className="project-reader-button project-details-button" aria-label={`View details for ${project.title}`} aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}>View details</button>
      </motion.div>
    </ProjectPopover>
  );
}

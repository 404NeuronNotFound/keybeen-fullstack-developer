import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectReaderStore } from '../../store';
import { projects } from '../../data';
import { useIsMobile } from '../../hooks';
import { PROJECT_SECTIONS } from '../../store/projectReaderStore';

export function ProjectBar() {
  const project = useProjectReaderStore((s) => s.currentProject);
  const section = useProjectReaderStore((s) => s.section);
  const openProject = useProjectReaderStore((s) => s.openProject);
  const previousProject = useProjectReaderStore((s) => s.previousProject);
  const nextProject = useProjectReaderStore((s) => s.nextProject);
  const isMobile = useIsMobile();
  const index = projects.findIndex((item) => item.id === project.id);

  return (
    <div className="project-bar" aria-label="Project reader" style={{ minHeight: isMobile ? 'var(--projectbar-h-mobile)' : 'var(--projectbar-h)', padding: isMobile ? '8px 12px' : '12px 20px', display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 12, flexShrink: 0, background: 'var(--sp-dark2)', borderTop: '1px solid var(--sp-dark3)' }}>
      <button className="project-bar-summary" onClick={() => openProject()} aria-label={`Read overview of ${project.title}`}>
        <img src={project.image} alt="" width={40} height={40} style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.title}</span>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--sp-gray)' }}>Project {index + 1} of {projects.length} · {PROJECT_SECTIONS[section]}</span>
        </span>
      </button>
      <button className="project-icon-button" onClick={previousProject} disabled={index === 0} aria-label="Previous project"><ChevronLeft size={20} /></button>
      <button className="project-icon-button project-open-button" onClick={() => openProject()} aria-label="Open project overview">
        <BookOpen size={20} />
        {!isMobile && <span>Read overview</span>}
      </button>
      <button className="project-icon-button" onClick={nextProject} disabled={index === projects.length - 1} aria-label="Next project"><ChevronRight size={20} /></button>
    </div>
  );
}

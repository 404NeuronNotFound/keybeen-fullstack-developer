import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useNavStore, useProjectReaderStore } from '../../store';
import { PROJECT_SECTIONS } from '../../store/projectReaderStore';
import { projects } from '../../data';
import { getProjectUrl } from '../../utils';

export function ProjectOverview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const project = useProjectReaderStore((s) => s.currentProject);
  const section = useProjectReaderStore((s) => s.section);
  const isOpen = useProjectReaderStore((s) => s.isOpen);
  const close = useProjectReaderStore((s) => s.close);
  const setSection = useProjectReaderStore((s) => s.setSection);
  const previousProject = useProjectReaderStore((s) => s.previousProject);
  const nextProject = useProjectReaderStore((s) => s.nextProject);
  const navigate = useNavStore((s) => s.navigate);
  const index = projects.findIndex((item) => item.id === project.id);
  const finalSection = section === PROJECT_SECTIONS.length - 1;
  const githubUrl = getProjectUrl(project.github);
  const liveUrl = getProjectUrl(project.live);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) dialogRef.current?.querySelector<HTMLElement>('.project-overview-content')?.scrollTo(0, 0);
  }, [isOpen, project.id, section]);

  const goTo = (page: 'contact' | 'projects') => {
    close();
    navigate(page);
  };

  return (
    <dialog id="project-overview" ref={dialogRef} className="project-overview" aria-labelledby="project-overview-title" onCancel={close} onClose={close}>
      <div className="project-overview-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, color: 'var(--sp-green)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Project overview · {project.year}</p>
            <h2 id="project-overview-title" style={{ fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1.25, overflowWrap: 'anywhere' }}>{project.title}</h2>
          </div>
          <button className="project-icon-button" onClick={close} aria-label="Close project overview" autoFocus><X size={20} /></button>
        </header>

        <nav aria-label="Overview sections" className="project-section-nav">
          {PROJECT_SECTIONS.map((label, step) => (
            <button key={label} onClick={() => setSection(step)} aria-current={section === step ? 'step' : undefined}>{step + 1}. {label}</button>
          ))}
        </nav>

        <section aria-labelledby="project-section-title" style={{ padding: '24px 0', minHeight: 160 }}>
          <p role="status" aria-live="polite" style={{ color: 'var(--sp-gray)', fontSize: 12, marginBottom: 8 }}>Section {section + 1} of {PROJECT_SECTIONS.length}</p>
          <h3 id="project-section-title" style={{ fontSize: 18, marginBottom: 16 }}>{PROJECT_SECTIONS[section]}</h3>
          {section === 0 && (
            <>
              <img src={project.image} alt="" className="project-overview-art" />
              <p style={{ color: 'var(--sp-gray)', fontSize: 15, lineHeight: 1.7 }}>{project.description}</p>
              {(githubUrl || liveUrl) && (
                <div className="project-overview-links">
                  {githubUrl && <a className="project-reader-button" href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`View repository for ${project.title}`}><FaGithub size={16} aria-hidden="true" />Repository</a>}
                  {liveUrl && <a className="project-reader-button" href={liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open demo for ${project.title}`}><ExternalLink size={16} aria-hidden="true" />Live demo</a>}
                </div>
              )}
            </>
          )}
          {section === 1 && (
            <ul className="project-technologies">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
          )}
          {section === 2 && (
            <>
              <p style={{ color: 'var(--sp-gray)', lineHeight: 1.7, marginBottom: 20 }}>Want to know more about this project? Get in touch, or explore the rest of my work.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="project-reader-button project-reader-primary" onClick={() => goTo('contact')}>Ask about this project</button>
                <button className="project-reader-button" onClick={() => goTo('projects')}>All projects</button>
              </div>
            </>
          )}
        </section>

        <footer style={{ borderTop: '1px solid var(--sp-dark3)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
            <button className="project-reader-button" disabled={section === 0} onClick={() => setSection(section - 1)}>Previous section</button>
            <button className="project-reader-button project-reader-primary" onClick={() => finalSection ? close() : setSection(section + 1)}>{finalSection ? 'Done' : 'Next section'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button className="project-icon-button" onClick={previousProject} disabled={index === 0} aria-label="Previous project"><ChevronLeft size={20} /></button>
            <span style={{ color: 'var(--sp-gray)', fontSize: 12 }}>Project {index + 1} of {projects.length}</span>
            <button className="project-icon-button" onClick={nextProject} disabled={index === projects.length - 1} aria-label="Next project"><ChevronRight size={20} /></button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}

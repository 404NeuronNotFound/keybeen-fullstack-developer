import type { Project } from '../../types';
import { useProjectReaderStore } from '../../store';
import { ProjectCover } from './ProjectCover';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { SaveProjectButton } from './SaveProjectButton';

export function TeaserRow({ project }: { project: Project; index?: number }) {
  const openProject = useProjectReaderStore(state => state.openProject);
  return (
    <tr className="project-teaser-row">
      <td>
        <div className="project-row-identity">
          <div className="project-row-cover"><ProjectCover project={project} compact /></div>
          <div className="project-row-title">
            <button type="button" className="project-title-button" aria-label={`View details for ${project.title}`} aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}>{project.shortTitle}</button>
            <p className="project-card-subtitle">{project.subtitle}</p>
            <span className="hide-on-desktop project-row-mobile-stack">{project.tags.join(' · ')}</span>
          </div>
          <SaveProjectButton project={project} />
        </div>
      </td>
      <td className="hide-on-mobile">{project.tags.join(' · ')}</td>
      <td><ProjectStatusBadge status={project.status} /><p className="project-availability">{project.availability}</p>{!project.status && <span aria-label="Status not specified">—</span>}</td>
      <td>{project.year}</td>
    </tr>
  );
}

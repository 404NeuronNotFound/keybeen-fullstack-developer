import type { Project } from '../../types';
import { TeaserRow } from './TeaserRow';

export function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <table className="project-table">
      <caption className="sr-only">Projects with technology stack, status, and year</caption>
      <thead><tr>
        <th scope="col">Project</th>
        <th scope="col" className="hide-on-mobile">Stack</th>
        <th scope="col" className="project-table-status">Status</th>
        <th scope="col" className="project-table-year">Year</th>
      </tr></thead>
      <tbody>{projects.map(project => <TeaserRow key={project.id} project={project} />)}</tbody>
    </table>
  );
}

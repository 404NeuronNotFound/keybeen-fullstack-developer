import type { Skill, Project } from '../../types';
import { getSkillContext } from '../../utils/skillEvidence';

interface Props {
  skill: Skill;
  relatedProjects: Project[];
  onProjectClick: (project: Project) => void;
}

export function SkillRow({ skill, relatedProjects, onProjectClick }: Props) {
  return <div className="skill-evidence-row">
    <h3>{skill.name}</h3>
    <p>{skill.description}</p>
    {relatedProjects.length > 0 ? <details>
      <summary>Used in {relatedProjects.length} {relatedProjects.length === 1 ? 'project' : 'projects'}</summary>
      <div className="skill-project-links">{relatedProjects.map(project => <button key={project.id} type="button" className="skill-project-link" aria-haspopup="dialog" aria-controls="project-overview" aria-label={'View details for ' + project.title} onClick={() => onProjectClick(project)}>{project.shortTitle}</button>)}</div>
    </details> : <p className="skill-context">{getSkillContext(skill.name, 'Part of my toolkit')}</p>}
  </div>;
}

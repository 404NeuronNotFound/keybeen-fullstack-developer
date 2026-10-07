import { TOOL_BRANDS } from '../../constants/toolBrands';
import type { Skill, Project } from '../../types';
import { getSkillContext } from '../../utils/skillEvidence';

interface Props {
  skill: Skill;
  index?: number;
  relatedProjects: Project[];
  onProjectClick: (project: Project) => void;
}

export function SkillRow({ skill, relatedProjects, onProjectClick, index }: Props) {
  const brand = TOOL_BRANDS[skill.name];
  const Icon = brand.icon;
  return <div className="skill-evidence-row">
    <div className="skill-row-heading"><span aria-hidden="true">{String(index ?? 1).padStart(2, '0')}</span><span className="skill-brand-mark" style={{ color: brand.color, background: brand.surface }}><Icon size={20} aria-hidden="true" /></span><h3>{skill.name}</h3></div>
    <p>{skill.description}</p>
    {relatedProjects.length > 0 ? <details>
      <summary>Used in {relatedProjects.length} {relatedProjects.length === 1 ? 'project' : 'projects'}</summary>
      <div className="skill-project-links">{relatedProjects.map(project => <button key={project.id} type="button" className="skill-project-link" aria-haspopup="dialog" aria-controls="project-overview" aria-label={'View details for ' + project.title} onClick={() => onProjectClick(project)}>{project.shortTitle}</button>)}</div>
    </details> : <p className="skill-context">{getSkillContext(skill.name, 'Part of my toolkit')}</p>}
  </div>;
}

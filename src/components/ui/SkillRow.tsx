import { TOOL_BRANDS } from '../../constants/toolBrands';
import type { Skill, Project } from '../../types';
import { getSkillContext } from '../../utils/skillEvidence';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

interface Props {
  skill: Skill;
  index?: number;
  relatedProjects: Project[];
  onProjectClick: (project: Project) => void;
  category?: string;
}

export function SkillRow({ skill, relatedProjects, onProjectClick, index, category }: Props) {
  const brand = TOOL_BRANDS[skill.name];
  const Icon = brand.icon;
  return <article className="skill-evidence-row">
    <div className="skill-row-heading"><span aria-hidden="true">{String(index ?? 1).padStart(2, '0')}</span><span className="skill-brand-mark" style={{ color: brand.color, background: brand.surface }}><Icon size={20} aria-hidden="true" /></span><div><h3>{skill.name}</h3>{category && <span className="skill-row-category">{category}</span>}</div></div>
    <p className="skill-row-description">{skill.description}</p>
    {relatedProjects.length > 0 ? <details>
      <summary><span>Used in {relatedProjects.length} {relatedProjects.length === 1 ? 'project' : 'projects'}<span className="sr-only"> with {skill.name}</span></span><ChevronDown size={14} aria-hidden="true" /></summary>
      <div className="skill-project-links">{relatedProjects.map(project => <button key={project.id} type="button" className="skill-project-link" aria-haspopup="dialog" aria-controls="project-overview" aria-label={'View details for ' + project.title} onClick={() => onProjectClick(project)}>{project.shortTitle}<ArrowUpRight size={13} aria-hidden="true" /></button>)}</div>
    </details> : <p className="skill-context">{getSkillContext(skill.name, 'Part of my toolkit')}</p>}
  </article>;
}

import { TOOL_BRANDS } from '../../constants/toolBrands';
import type { Skill } from '../../types';
import { useProjectReaderStore } from '../../store';
import { getSkillContext, getSkillProjects } from '../../utils/skillEvidence';
import { ArrowUpRight } from 'lucide-react';

interface Props {
  skill: Skill;
  track?: number;
}

export function TopSkillCard({ skill, track }: Props) {
  const brand = TOOL_BRANDS[skill.name];
  const Icon = brand.icon;
  const openProject = useProjectReaderStore(state => state.openProject);
  const project = getSkillProjects(skill.name)[0];
  return <article className="top-skill-card">
    <div className="top-skill-art"><span className="top-skill-track" aria-hidden="true">{String(track ?? 1).padStart(2, '0')}</span><span className="tool-record-ring" aria-hidden="true" /><span className="tool-brand-mark" style={{ color: brand.color, background: brand.surface }}><Icon size={42} aria-hidden="true" /></span></div>
    <h3>{skill.name}</h3>
    {project ? <button type="button" className="top-skill-evidence" aria-label={`See ${skill.name} in ${project.shortTitle}`} aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}><span>{getSkillContext(skill.name, skill.description)}</span><ArrowUpRight size={14} aria-hidden="true" /></button> : <p>{skill.description}</p>}
  </article>;
}

import { TOOL_BRANDS } from '../../constants/toolBrands';
import type { Skill } from '../../types';
import { useProjectReaderStore } from '../../store';
import { getSkillContext, getSkillProjects } from '../../utils/skillEvidence';

interface Props {
  skill: Skill;
  track?: number;
}

export function TopSkillCard({ skill, track }: Props) {
  const brand = TOOL_BRANDS[skill.name];
  const Icon = brand.icon;
  const openProject = useProjectReaderStore(state => state.openProject);
  const project = getSkillProjects(skill.name)[0];
  return <div className="top-skill-card">
    <div className="top-skill-art"><span className="top-skill-track" aria-hidden="true">{String(track ?? 1).padStart(2, '0')}</span><span className="tool-record-ring" aria-hidden="true" /><span className="tool-brand-mark" style={{ color: brand.color, background: brand.surface }}><Icon size={42} aria-hidden="true" /></span></div>
    <h3>{skill.name}</h3>
    {project ? <button type="button" className="top-skill-evidence" aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}>{getSkillContext(skill.name, skill.description)}</button> : <p>{skill.description}</p>}
  </div>;
}

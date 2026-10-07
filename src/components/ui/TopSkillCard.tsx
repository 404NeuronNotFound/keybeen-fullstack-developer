import type { LucideIcon } from 'lucide-react';
import type { Skill } from '../../types';
import { useProjectReaderStore } from '../../store';
import { getSkillContext, getSkillProjects } from '../../utils/skillEvidence';

interface Props {
  skill: Skill;
  icon: LucideIcon;
  gradient: string;
}

export function TopSkillCard({ skill, icon: Icon, gradient }: Props) {
  const openProject = useProjectReaderStore(state => state.openProject);
  const project = getSkillProjects(skill.name)[0];
  return <div className="top-skill-card">
    <div className={'grad-' + gradient} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon size={36} color="var(--sp-art-text)" strokeWidth={1.5} /></div>
    <h3>{skill.name}</h3>
    {project ? <button type="button" className="top-skill-evidence" aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}>{getSkillContext(skill.name, skill.description)}</button> : <p>{skill.description}</p>}
  </div>;
}

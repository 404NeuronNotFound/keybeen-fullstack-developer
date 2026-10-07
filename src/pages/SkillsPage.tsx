import { useState } from 'react';
import { Code2, Server, Cloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TopSkillCard } from '../components/ui';
import { SkillRow } from '../components/ui/SkillRow';
import { PageNextStep } from '../components/ui/PageNextStep';
import { skills } from '../data';
import { CORE_SKILL_NAMES } from '../data/skills';
import { getSkillProjects } from '../utils/skillEvidence';
import { useProjectReaderStore } from '../store';

const CATEGORY_ICONS: Record<string, LucideIcon> = { Frontend: Code2, Backend: Server, DevTools: Cloud };
const GRADIENTS = ['emerald', 'blue', 'purple', 'teal', 'yellow'];
const categories = Object.keys(skills);
const allSkills = Object.entries(skills).flatMap(([category, list]) => list.map(skill => ({ ...skill, category })));
const topSkills = CORE_SKILL_NAMES.flatMap(name => allSkills.filter(skill => skill.name === name));

export function SkillsPage() {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const openProject = useProjectReaderStore(state => state.openProject);
  return <div className="page">
    <p className="discography-eyebrow">Tech stack</p>
    <h1 className="discography-title">Tools of the trade</h1>
    <h2 className="skill-section-title">Most played</h2>
    <p className="skill-section-caption">Core tools behind my web and mobile projects.</p>
    <div className="top-skills-grid">{topSkills.map((skill, index) => <TopSkillCard key={skill.name} skill={skill} icon={CATEGORY_ICONS[skill.category]} gradient={GRADIENTS[index]} />)}</div>
    <div className="skill-tabs" role="group" aria-label="Skill categories">{categories.map(category => <button key={category} className="skill-tab" aria-pressed={activeTab === category} onClick={() => setActiveTab(category)}>{category}</button>)}</div>
    <div className="skill-evidence-list">{skills[activeTab].map(skill => <SkillRow key={skill.name} skill={skill} relatedProjects={getSkillProjects(skill.name)} onProjectClick={openProject} />)}</div>
    <PageNextStep title="See the tools at work" description="Explore the projects built with this stack." page="projects" label="View projects" />
  </div>;
}

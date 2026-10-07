import { useState } from 'react';
import { Code2, Server, Cloud, Disc3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TopSkillCard } from '../components/ui';
import { SkillRow } from '../components/ui/SkillRow';
import { PageNextStep } from '../components/ui/PageNextStep';
import { skills } from '../data';
import { CORE_SKILL_NAMES } from '../data/skills';
import { getSkillProjects } from '../utils/skillEvidence';
import { useProjectReaderStore } from '../store';

const CATEGORY_ICONS: Record<string, LucideIcon> = { Frontend: Code2, Backend: Server, DevTools: Cloud };
const categories = Object.keys(skills);
const allSkills = Object.entries(skills).flatMap(([category, list]) => list.map(skill => ({ ...skill, category })));
const topSkills = CORE_SKILL_NAMES.flatMap(name => allSkills.filter(skill => skill.name === name));

export function SkillsPage() {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const openProject = useProjectReaderStore(state => state.openProject);
  const CategoryIcon = CATEGORY_ICONS[activeTab];
  return <div className="page skills-page">
    <header className="skills-page-heading"><div>
    <p className="discography-eyebrow">Tech stack</p>
    <h1 className="discography-title">Tools of the trade</h1>
    <p className="skill-page-intro">The tools I reach for, with projects to show how I use them.</p>
    </div><Disc3 className="skills-heading-record" size={84} strokeWidth={1} aria-hidden="true" /></header>
    <div className="skills-section-heading"><h2 className="skill-section-title">Most played</h2><span>Core stack</span></div>
    <p className="skill-section-caption">Core tools behind my web and mobile projects.</p>
    <div className="top-skills-grid">{topSkills.map((skill, index) => <TopSkillCard key={skill.name} skill={skill} track={index + 1} />)}</div>
    <section className="skills-library">
    <div className="skills-library-header"><h2><CategoryIcon size={20} aria-hidden="true" />{activeTab}</h2><span>{skills[activeTab].length} tools</span></div>
    <div className="skill-tabs" role="group" aria-label="Skill categories">{categories.map(category => <button key={category} className="skill-tab" aria-pressed={activeTab === category} onClick={() => setActiveTab(category)}>{category}</button>)}</div>
    <div className="skill-evidence-list">{skills[activeTab].map((skill, index) => <SkillRow key={skill.name} skill={skill} index={index + 1} relatedProjects={getSkillProjects(skill.name)} onProjectClick={openProject} />)}</div>
    </section>
    <PageNextStep title="See the tools at work" description="Explore the projects built with this stack." page="projects" label="View projects" />
  </div>;
}

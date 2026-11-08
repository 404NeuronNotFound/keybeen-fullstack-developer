import { useRef, useState } from 'react';
import { ArrowUpRight, Code2, Server, Wrench, Search, X, Library, ArrowRight } from 'lucide-react';
import { TopSkillCard } from '../components/ui';
import { SkillRow } from '../components/ui/SkillRow';
import { Button } from '../components/ui/Button';
import { skills } from '../data';
import { CORE_SKILL_NAMES } from '../data/skills';
import { getSkillProjects } from '../utils/skillEvidence';
import { useProjectReaderStore, useNavStore } from '../store';
import { useSkillsMotion } from '../hooks/useSkillsMotion';
import '../styles/skills.css';

const categories = [
  { id: 'Frontend', label: 'Frontend', detail: 'Interfaces & interaction', icon: Code2 },
  { id: 'Backend', label: 'Backend', detail: 'Logic & data', icon: Server },
  { id: 'DevTools', label: 'Dev tools', detail: 'Build, debug & ship', icon: Wrench },
];
const allSkills = Object.entries(skills).flatMap(([category, list]) => list.map(skill => ({ ...skill, category })));
const topSkills = CORE_SKILL_NAMES.flatMap(name => allSkills.filter(skill => skill.name === name));

export function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const root = useSkillsMotion(activeCategory, query);
  const openProject = useProjectReaderStore(state => state.openProject);
  const navigate = useNavStore(state => state.navigate);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSkills = allSkills.filter(skill =>
    (activeCategory === 'All' || skill.category === activeCategory)
    && `${skill.name} ${skill.description}`.toLowerCase().includes(normalizedQuery),
  );

  return <div ref={root} className="page skills-page skills-studio">
    <header className="skills-intro">
      <div className="skills-intro-copy">
        <p className="skills-eyebrow"><Code2 size={14} aria-hidden="true" />My working toolkit</p>
        <h1>Tools of the trade<span>.</span></h1>
        <p className="skills-intro-description">The tools I reach for, with projects to show how I use them.</p>
        <p className="skills-intro-note">Web & mobile<span aria-hidden="true">/</span>{allSkills.length} tools<span aria-hidden="true">/</span>{categories.length} disciplines</p>
      </div>
      <dl className="skills-discipline-index">
        {categories.map(({ id, label, detail, icon: Icon }) => <div key={id}>
          <dt><Icon size={18} strokeWidth={1.5} aria-hidden="true" /><span>{label}<small>{detail}</small></span></dt>
          <dd>{String(skills[id].length).padStart(2, '0')}<span className="sr-only"> tools</span></dd>
        </div>)}
      </dl>
    </header>

    <section className="skills-core" aria-labelledby="skills-core-title">
      <div className="skills-block-heading" data-skills-reveal>
        <div><p className="skills-eyebrow">The regular rotation</p><h2 id="skills-core-title">Most played</h2></div>
        <p>A curated core stack</p>
      </div>
      <div className="skills-core-grid">{topSkills.map((skill, index) => <div key={skill.name} className="skills-core-item" data-skills-reveal data-skills-order={index}><TopSkillCard skill={skill} track={index + 1} /></div>)}</div>
      <p className="skills-core-hint"><ArrowUpRight size={13} aria-hidden="true" />Open a tool to see a project built with it.</p>
    </section>

    <section className="skills-toolkit" aria-labelledby="skills-library-title">
      <div className="skills-block-heading skills-toolkit-heading">
        <div><p className="skills-eyebrow"><Library size={13} aria-hidden="true" />The library</p><h2 id="skills-library-title">Explore the toolkit</h2></div>
        <label className="skills-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search tools by name or description</span><input ref={searchRef} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a tool..." aria-controls="skills-results" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={15} aria-hidden="true" /></button>}</label>
      </div>
      <div className="skills-filters" role="group" aria-label="Filter tools by category">
        <button type="button" aria-pressed={activeCategory === 'All'} onClick={() => setActiveCategory('All')}>All tools<span>{allSkills.length}</span></button>
        {categories.map(({ id, label }) => <button type="button" key={id} aria-pressed={activeCategory === id} onClick={() => setActiveCategory(id)}>{label}<span>{skills[id].length}</span></button>)}
      </div>
      <div className="skills-results-meta"><p role="status">{filteredSkills.length} {filteredSkills.length === 1 ? 'tool' : 'tools'}{activeCategory !== 'All' ? ` in ${categories.find(category => category.id === activeCategory)?.label}` : ' in the library'}{normalizedQuery ? ` matching “${query.trim()}”` : ''}</p><span>Expand a tool for project evidence</span></div>
      <div id="skills-results" className="skills-results">
        {filteredSkills.length ? <div className="skills-tracklist">{filteredSkills.map((skill, index) => <SkillRow key={skill.name} skill={skill} index={index + 1} category={categories.find(category => category.id === skill.category)?.label} relatedProjects={getSkillProjects(skill.name)} onProjectClick={openProject} />)}</div> : <div className="skills-empty"><Search size={24} strokeWidth={1.5} aria-hidden="true" /><h3>No tools found</h3><p>Try another name or browse the full library.</p><button type="button" className="ui-button ui-button--outline ui-button--rounded" onClick={() => { setQuery(''); setActiveCategory('All'); searchRef.current?.focus(); }}>Show all tools<ArrowRight size={14} aria-hidden="true" /></button></div>}
      </div>
    </section>

    <footer className="skills-signoff" data-skills-reveal><div><p className="skills-eyebrow">Tools are only part of it</p><h2>See what I built with them.</h2><p>Explore the projects, their purpose, and the stack behind each one.</p></div><Button rounded onClick={() => navigate('projects')}>View projects<ArrowUpRight size={17} aria-hidden="true" /></Button></footer>
  </div>;
}

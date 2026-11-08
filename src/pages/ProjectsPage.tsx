import { useState } from 'react';
import { Heart, Disc3, ArrowUpRight, ArrowRight } from 'lucide-react';
import { TeaserCard } from '../components/ui';
import { projects } from '../data';
import { PROJECT_STATUSES } from '../constants/projects';
import { useSavedProjectsStore } from '../store/savedProjectsStore';
import { useNavStore } from '../store';
import type { ProjectStatus } from '../types';
import { useProjectsMotion } from '../hooks/useProjectsMotion';
import '../styles/projects.css';

const categories = [...new Set(projects.map(project => project.category))];
const statuses = PROJECT_STATUSES.filter(status => projects.some(project => project.status === status.value));

export function ProjectsPage() {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const savedIds = useSavedProjectsStore(state => state.savedProjectIds);
  const navigate = useNavStore(state => state.navigate);
  const filtered = projects.filter(project =>
    (category === 'all' || project.category === category)
    && (status === 'all' || project.status === status)
    && (!savedOnly || savedIds.includes(project.id))
  );
  const clearFilters = () => { setCategory('all'); setStatus('all'); setSavedOnly(false); };
  const root = useProjectsMotion(filtered.map(project => project.id).join(','));
  const hasFilters = category !== 'all' || status !== 'all' || savedOnly;

  return (
    <div ref={root} className="page projects-page">
      <header className="projects-heading">
        <div className="projects-heading-copy">
          <p className="projects-eyebrow"><Disc3 size={14} aria-hidden="true" />Projects</p>
          <h1><span className="projects-title-mask"><span className="projects-title-word">The</span></span>{' '}<span className="projects-title-mask"><span className="projects-title-word">discography<span className="projects-title-dot">.</span></span></span></h1>
          <p>Web and mobile projects for schools, small shops, and everyday problems.</p>
        </div>
        <div className="projects-catalogue"><span>{String(projects.length).padStart(2, '0')}</span><p>Projects in the collection</p></div>
        <span className="projects-intro-rule" aria-hidden="true" />
      </header>

      <div className="project-filter-toolbar projects-toolbar" role="group" aria-label="Filter projects">
        <label className="project-filter-select"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="project-filter-select"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value as ProjectStatus | 'all')}><option value="all">All statuses</option>{statuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button type="button" className="saved-project-filter" aria-pressed={savedOnly} onClick={() => setSavedOnly(value => !value)}><Heart size={14} fill={savedOnly ? 'currentColor' : 'none'} aria-hidden="true" />Saved<span>{savedIds.length}</span></button>
        {hasFilters && <button type="button" className="project-filter-clear" onClick={clearFilters}>Clear filters</button>}
      </div>

      <section className="projects-collection" aria-labelledby="projects-collection-title">
        <div className="projects-collection-heading"><h2 id="projects-collection-title">{savedOnly ? 'Saved projects' : category !== 'all' ? category : 'All projects'}</h2><p role="status" aria-live="polite">{filtered.length} of {projects.length} projects</p></div>
        {filtered.length ? <ul className="projects-album-grid">{filtered.map((project, index) => <li className="projects-album-item" key={project.id} data-project-reveal data-project-order={index}><TeaserCard project={project} showContext /></li>)}</ul> : <div className="projects-empty">
          <Heart size={26} strokeWidth={1.5} aria-hidden="true" /><h3>{savedOnly && savedIds.length === 0 ? 'No saved projects yet' : 'No matching projects'}</h3><p>{savedOnly && savedIds.length === 0 ? 'Use the heart on a project to keep it in your collection.' : 'Try another category or status to explore the collection.'}</p><button type="button" className="ui-button ui-button--outline ui-button--rounded" onClick={clearFilters}>Browse all projects<ArrowRight size={15} aria-hidden="true" /></button>
        </div>}
      </section>
      <footer className="projects-signoff"><p>Have a project of your own in mind?</p><button type="button" onClick={() => navigate('contact')}>Let's talk<ArrowUpRight size={15} aria-hidden="true" /></button></footer>
    </div>
  );
}

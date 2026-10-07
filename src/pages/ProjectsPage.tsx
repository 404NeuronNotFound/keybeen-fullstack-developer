import { useState } from 'react';
import { Heart } from 'lucide-react';
import { TeaserCard } from '../components/ui';
import { projects } from '../data';
import { PROJECT_STATUSES } from '../constants/projects';
import { useSavedProjectsStore } from '../store/savedProjectsStore';
import type { ProjectStatus } from '../types';

const categories = [...new Set(projects.map(project => project.category))];
const statuses = PROJECT_STATUSES.filter(status => projects.some(project => project.status === status.value));

export function ProjectsPage() {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const savedIds = useSavedProjectsStore(state => state.savedProjectIds);
  const filtered = projects.filter(project =>
    (category === 'all' || project.category === category)
    && (status === 'all' || project.status === status)
    && (!savedOnly || savedIds.includes(project.id))
  );
  const clearFilters = () => { setCategory('all'); setStatus('all'); setSavedOnly(false); };

  return (
    <div className="page">
      <p className="discography-eyebrow">Projects</p>
      <h1 className="discography-title">The discography</h1>
      <p className="discography-intro">Explore the ideas, tools, and decisions behind my work. Save a project to come back to it later.</p>
      <div className="project-filter-toolbar" role="group" aria-label="Filter projects">
        <label className="project-filter-select"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="project-filter-select"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value as ProjectStatus | 'all')}><option value="all">All statuses</option>{statuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <button className="saved-project-filter" aria-pressed={savedOnly} onClick={() => setSavedOnly(value => !value)}><Heart size={15} aria-hidden="true" />Saved ({savedIds.length})</button>
        {(category !== 'all' || status !== 'all' || savedOnly) && <button className="project-filter-clear" onClick={clearFilters}>Clear filters</button>}
      </div>
      <p role="status" aria-live="polite" className="project-result-count">{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}{savedOnly ? ' in your saved selection' : ''}</p>
      {filtered.length ? <>
        <div className="discography-grid">{filtered.map(project => <TeaserCard key={project.id} project={project} />)}</div>
      </> : <div className="project-empty-state"><p>{savedOnly && savedIds.length === 0 ? 'Use the heart on a project to save it here.' : 'No projects match these filters.'}</p><button className="project-reader-button" onClick={clearFilters}>Browse all projects</button></div>}
    </div>
  );
}

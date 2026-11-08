import { useState } from 'react';
import { GraduationCap, Monitor, Sparkles, ChevronDown, Cpu, ArrowUpRight, Route } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExperienceItem } from '../types';
import { Tag } from '../components/ui';
import { PageNextStep } from '../components/ui/PageNextStep';
import { experience, projects } from '../data';
import { useProjectReaderStore } from '../store';
import { useExperienceMotion } from '../hooks/useExperienceMotion';
import '../styles/experience.css';

const ICONS: Record<ExperienceItem['icon'], LucideIcon> = {
  cpu: Cpu, monitor: Monitor, graduation: GraduationCap, sparkles: Sparkles,
};

// Only connect entries to work explicitly described in their history.
const RELATED_PROJECTS: Record<number, number[]> = { 1: [2, 4], 3: [1] };

export function ExperiencePage() {
  const [openId, setOpenId] = useState<number | null>(experience[0]?.id ?? null);
  const root = useExperienceMotion(openId);
  const openProject = useProjectReaderStore(state => state.openProject);
  return <div ref={root} className="page experience-page experience-editorial">
    <header className="experience-page-heading">
      <div className="experience-heading-copy">
        <p className="experience-eyebrow"><Route size={14} aria-hidden="true" />Experience</p>
        <h1>My journey<span>.</span></h1>
        <p className="experience-intro">From "Hello, World!" to building practical web and mobile projects.</p>
      </div>
      <div className="experience-origin"><p>It started with</p><strong>Hello, World!</strong><span>{experience.at(-1)?.period}</span></div>
    </header>
    <div className="experience-timeline-heading"><p className="experience-order-note">{experience.length} chapters<span aria-hidden="true">/</span>Latest first</p><p>Select a role for the details.</p></div>
    <div className="experience-timeline">
    <div className="experience-rail" aria-hidden="true"><span /></div>
    <ol className="experience-tree" aria-label="Experience timeline, latest first">
      {experience.map(job => {
        const Icon = ICONS[job.icon];
        const isOpen = openId === job.id;
        return <li key={job.id} className="experience-node" data-expanded={isOpen} data-experience-reveal>
          <div className="experience-date"><span>{job.period}</span><small>{job.type}</small></div>
          <div className="experience-node-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></div>
          <article className="experience-node-panel" aria-labelledby={'experience-title-' + job.id}>
            <div className="experience-node-meta"><span>{job.period}</span><span className="experience-type">{job.type}</span></div>
            <h2 id={'experience-title-' + job.id}>
              <button type="button" className="experience-node-toggle" aria-expanded={isOpen} aria-controls={'experience-detail-' + job.id} onClick={() => setOpenId(isOpen ? null : job.id)}>
                <span>{job.role}</span><ChevronDown size={18} aria-hidden="true" />
              </button>
            </h2>
            <p className="experience-node-company">{job.company}</p>
            <div id={'experience-detail-' + job.id} className="experience-node-detail" aria-hidden={!isOpen} inert={!isOpen}>
              <div className="experience-node-detail-inner">
                <p>{job.description}</p>
                <div className="experience-node-tags">{job.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
                {RELATED_PROJECTS[job.id] && <div className="experience-related"><p>Related work</p><div>{projects.filter(project => RELATED_PROJECTS[job.id].includes(project.id)).map(project => <button key={project.id} type="button" onClick={() => openProject(project)} aria-haspopup="dialog" aria-controls="project-overview" aria-label={`View details for ${project.title}`}>{project.shortTitle}<ArrowUpRight size={14} aria-hidden="true" /></button>)}</div></div>}
              </div>
            </div>
          </article>
        </li>;
      })}
    </ol>
    </div>
    <PageNextStep title="Explore my work" description="See the projects behind this development journey." page="projects" label="View projects" />
  </div>;
}

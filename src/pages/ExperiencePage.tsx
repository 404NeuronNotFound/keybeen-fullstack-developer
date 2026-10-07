import { useState } from 'react';
import { GraduationCap, Monitor, Sparkles, ChevronDown, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ExperienceItem } from '../types';
import { Tag } from '../components/ui';
import { PageNextStep } from '../components/ui/PageNextStep';
import { experience } from '../data';

const ICONS: Record<ExperienceItem['icon'], LucideIcon> = {
  cpu: Cpu, monitor: Monitor, graduation: GraduationCap, sparkles: Sparkles,
};

export function ExperiencePage() {
  const [openId, setOpenId] = useState<number | null>(experience[0]?.id ?? null);
  return <div className="page experience-page">
    <header className="experience-page-heading">
      <div className="experience-heading-copy">
        <p className="discography-eyebrow">Experience</p>
        <h1>My journey</h1>
        <p className="experience-intro">From "Hello, World!" to building practical web and mobile projects.</p>
      </div>
    </header>
    <p className="experience-order-note">Latest first</p>
    <ol className="experience-tree" aria-label="Experience timeline, latest first">
      {experience.map(job => {
        const Icon = ICONS[job.icon];
        const isOpen = openId === job.id;
        return <li key={job.id} className="experience-node" data-expanded={isOpen}>
          <div className="experience-node-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></div>
          <article className="experience-node-panel" aria-labelledby={'experience-title-' + job.id}>
            <div className="experience-node-meta"><span>{job.period}</span><span className="experience-type">{job.type}</span></div>
            <h2 id={'experience-title-' + job.id}>
              <button type="button" className="experience-node-toggle" aria-expanded={isOpen} aria-controls={'experience-detail-' + job.id} onClick={() => setOpenId(isOpen ? null : job.id)}>
                <span>{job.role}</span><ChevronDown size={18} aria-hidden="true" />
              </button>
            </h2>
            <p className="experience-node-company">{job.company}</p>
            <div id={'experience-detail-' + job.id} className="experience-node-detail" hidden={!isOpen}>
              <p>{job.description}</p>
              <div className="experience-node-tags">{job.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
            </div>
          </article>
        </li>;
      })}
    </ol>
    <PageNextStep title="Explore my work" description="See the projects behind this development journey." page="projects" label="View projects" />
  </div>;
}

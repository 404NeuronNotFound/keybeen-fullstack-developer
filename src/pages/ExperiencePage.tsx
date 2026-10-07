import { useState } from 'react';
import { GraduationCap, Monitor, Sparkles, ChevronDown, Cpu, ListMusic, ArrowUpRight } from 'lucide-react';
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
      <div className="experience-playlist-art" aria-hidden="true"><span className="experience-art-lines" /><ListMusic size={44} strokeWidth={1.4} /><span>MY JOURNEY</span></div>
      <div className="experience-heading-copy">
        <p className="discography-eyebrow">Experience</p>
        <h1>My journey</h1>
        <p className="experience-intro">From "Hello, World!" to building practical web and mobile projects.</p>
        <p className="experience-collection-note">{experience.length} chapters <span aria-hidden="true">/</span> Personal projects, internship & learning</p>
      </div>
    </header>
    <div className="experience-section-heading"><h2>The chapters</h2><span>Latest first</span></div>
    <div className="experience-chapter-grid">
      {experience.map((job, index) => {
        const Icon = ICONS[job.icon];
        const isOpen = openId === job.id;
        return <article key={job.id} className="experience-chapter" data-expanded={isOpen}>
          <div className="experience-chapter-meta"><span className="experience-type">{job.type}</span><span>{job.period}</span></div>
          <div className="experience-chapter-identity">
            <div className="experience-chapter-art" data-kind={job.icon} aria-hidden="true"><Icon size={30} strokeWidth={1.5} /><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div><h3 id={'experience-title-' + job.id}>{job.role}</h3><p>{job.company}</p></div>
          </div>
          <button type="button" className="experience-chapter-toggle" aria-expanded={isOpen} aria-controls={'experience-detail-' + job.id} aria-label={(isOpen ? 'Hide contributions: ' : 'Read contributions: ') + job.role} onClick={() => setOpenId(isOpen ? null : job.id)}>
            <span>{isOpen ? 'Close chapter' : 'Read chapter'}</span><ChevronDown size={16} aria-hidden="true" />
          </button>
          <div id={'experience-detail-' + job.id} className="experience-chapter-detail" hidden={!isOpen}>
            <p>{job.description}</p>
            <div className="experience-chapter-tags">{job.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
          </div>
        </article>;
      })}
    </div>
    <div className="experience-end-note"><ArrowUpRight size={16} aria-hidden="true" /><p>Each chapter adds something to the way I build today.</p></div>
    <PageNextStep title="Explore my work" description="See the projects behind this development journey." page="projects" label="View projects" />
  </div>;
}

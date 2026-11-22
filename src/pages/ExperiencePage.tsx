import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Monitor, Cpu, Sparkles, ArrowUpRight, Disc3, Play, Pause, SkipBack, SkipForward, ListMusic } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, KeyboardEvent } from 'react';
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
const RELATED_PROJECTS: Record<number, number[]> = { 1: [2, 4], 3: [1] };
const CHAPTER_NAMES: Record<number, string> = {
  4: 'First line of code', 3: 'Building the full stack', 2: 'Inside the ICT Center', 1: 'Independent builds',
};
const chapters = [...experience].reverse();
const CHAPTER_DURATION = 12000;

export function ExperiencePage() {
  const [selected, setSelected] = useState(chapters.length - 1);
  const [playing, setPlaying] = useState(false);
  const remaining = useRef(CHAPTER_DURATION);
  const previousChapter = useRef(selected);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const job = chapters[selected];
  const Icon = ICONS[job.icon];
  const root = useExperienceMotion(job.id);
  const openProject = useProjectReaderStore(state => state.openProject);
  const related = projects.filter(project => RELATED_PROJECTS[job.id]?.includes(project.id));

  useEffect(() => {
    if (previousChapter.current !== selected) {
      remaining.current = CHAPTER_DURATION;
      previousChapter.current = selected;
    }
    if (!playing) return;
    const started = performance.now();
    let completed = false;
    const timer = window.setTimeout(() => {
      completed = true;
      remaining.current = CHAPTER_DURATION;
      if (selected < chapters.length - 1) setSelected(selected + 1);
      else setPlaying(false);
    }, remaining.current);
    const onHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      clearTimeout(timer); document.removeEventListener('visibilitychange', onHidden);
      if (!completed) remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [playing, selected]);

  const selectChapter = (index: number) => {
    setPlaying(false);
    setSelected(Math.max(0, Math.min(chapters.length - 1, index)));
  };
  const toggleTour = () => {
    if (playing) { setPlaying(false); return; }
    if (selected === chapters.length - 1) setSelected(0);
    setPlaying(true);
  };
  const onRoadmapKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: chapters.length - 1 };
    const target = keys[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = Math.max(0, Math.min(chapters.length - 1, target));
    selectChapter(next); buttons.current[next]?.focus();
  };

  return <div ref={root} className="page experience-page experience-setlist" data-guided={playing}>
    <header className="experience-page-heading">
      <div className="experience-heading-copy">
        <p className="experience-eyebrow"><Disc3 size={14} aria-hidden="true" />Experience</p>
        <h1>My journey<span>.</span></h1>
        <p className="experience-intro">From “Hello, World!” to building practical web and mobile projects.</p>
      </div>
      <div className="experience-edition"><span>THE CAREER SETLIST</span><strong>{chapters[0].period}<span aria-hidden="true">—</span>Present</strong><p>{chapters.length} chapters. Still adding to the collection.</p></div>
    </header>

    <section className="career-roadmap" aria-labelledby="career-roadmap-title" style={{ '--track-count': chapters.length, '--route-progress': selected / Math.max(1, chapters.length - 1) } as CSSProperties}>
      <div className="career-section-heading"><h2 id="career-roadmap-title"><ListMusic size={16} aria-hidden="true" />The tracklist</h2><p>Select a chapter to explore the journey.</p></div>
      <div className="career-route">
        <div className="career-route-rail" aria-hidden="true"><span /></div>
        <ol className="career-route-list" aria-label="Career roadmap, earliest to latest">
          {chapters.map((chapter, index) => {
            const ChapterIcon = ICONS[chapter.icon];
            const active = selected === index;
            return <li key={chapter.id} data-active={active} data-passed={index < selected}>
              <button ref={element => { buttons.current[index] = element; }} type="button" className="career-stop" aria-pressed={active} aria-controls="career-chapter" aria-label={`Chapter ${index + 1}: ${CHAPTER_NAMES[chapter.id]}, ${chapter.period}`} onClick={() => selectChapter(index)} onKeyDown={event => onRoadmapKey(event, index)}>
                <span className="career-stop-date">{chapter.period}</span>
                <span className="career-stop-node" aria-hidden="true"><ChapterIcon size={20} strokeWidth={1.6} /><span className="career-stop-number">{String(index + 1).padStart(2, '0')}</span></span>
                <span className="career-stop-copy"><strong>{CHAPTER_NAMES[chapter.id]}</strong><span>{chapter.company}</span></span>
              </button>
            </li>;
          })}
        </ol>
      </div>
    </section>

    <section id="career-chapter" className="career-player" aria-labelledby="career-role-title">
      <div className="career-sleeve">
        <div className="career-sleeve-heading"><span>CAREER / VOL. 01</span><Disc3 size={15} aria-hidden="true" /></div>
        <div className="career-record" aria-hidden="true"><div className="career-record-spin"><div className="career-record-label"><Icon size={30} strokeWidth={1.3} /><span>KEYBEEN · {String(selected + 1).padStart(2, '0')}</span><i /></div></div></div>
        <div className="career-sleeve-caption"><span>{job.period}</span><strong>{CHAPTER_NAMES[job.id]}</strong><span className="career-wave" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ height: `${[7, 13, 20, 11, 26, 18, 30, 14, 23, 12, 18, 7][index]}px` }} />)}</span></div>
      </div>

      <div className="career-player-main">
        <div className="career-player-meta"><span><span className="career-status-dot" />{playing ? 'Guided tour' : 'Now exploring'}</span><span>{String(selected + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span></div>
        <div className="career-chapter-copy" key={job.id}>
          <p className="career-role-type">{job.type}</p>
          <h2 id="career-role-title">{job.role}</h2>
          <p className="career-company">{job.company}<span aria-hidden="true">·</span>{job.period}</p>
          <p className="career-description">{job.description}</p>
          <div className="career-tags" aria-label="Tools and skills">{job.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
          {related.length > 0 && <div className="career-related"><span>Work from this chapter</span><div>{related.map(project => <button key={project.id} type="button" onClick={() => openProject(project)} aria-haspopup="dialog" aria-controls="project-overview" aria-label={`View details for ${project.title}`}>{project.shortTitle}<ArrowUpRight size={14} aria-hidden="true" /></button>)}</div></div>}
        </div>

        <div className="career-transport">
          <div className="career-tour-progress" aria-hidden="true"><span key={selected} /></div>
          <div className="career-transport-row">
            <div className="career-transport-buttons">
              <button type="button" className="career-skip" disabled={selected === 0} aria-label="Previous chapter" onClick={() => selectChapter(selected - 1)}><SkipBack size={18} fill="currentColor" /></button>
              <button type="button" className="career-play" aria-pressed={playing} onClick={toggleTour}>{playing ? <Pause size={16} fill="currentColor" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}<span>{playing ? 'Pause tour' : 'Play journey'}</span></button>
              <button type="button" className="career-skip" disabled={selected === chapters.length - 1} aria-label="Next chapter" onClick={() => selectChapter(selected + 1)}><SkipForward size={18} fill="currentColor" /></button>
            </div>
            <p className="career-tour-note" role="status">{playing ? 'Auto-advancing · 12s per chapter' : 'Explore at your own pace'}</p>
          </div>
        </div>
      </div>
    </section>
    <PageNextStep title="Explore my work" description="See the projects behind this development journey." page="projects" label="View projects" />
  </div>;
}

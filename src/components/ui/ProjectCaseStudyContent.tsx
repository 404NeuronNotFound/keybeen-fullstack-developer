import type { ProjectCaseStudy } from '../../types';

export function ProjectCaseStudyContent({ study }: { study: ProjectCaseStudy }) {
  const sections = [
    ['Problem', [study.problem]],
    ['Intended users', [study.intendedUsers]],
    ['My role', [study.role]],
    ['Constraints', study.constraints],
    ['Decisions', study.decisions],
    ['Outcome', [study.outcome]],
    ['Lessons', study.lessons],
    ['Next steps', study.nextSteps],
  ] as const;
  return <article className="project-case-study">
    {sections.map(([title, paragraphs]) => <section key={title}><h4>{title}</h4>{paragraphs.map(text => <p key={text}>{text}</p>)}</section>)}
    {study.screenshots.length > 0 && <section><h4>Screenshots</h4>{study.screenshots.map(shot => <figure key={shot.src}><img src={shot.src} alt={shot.caption} /><figcaption>{shot.caption}</figcaption></figure>)}</section>}
    <aside className="project-liner-note"><h4>Liner note</h4><p>{study.linerNote}</p></aside>
  </article>;
}

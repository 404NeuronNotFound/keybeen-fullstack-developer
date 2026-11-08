import { ArrowRight, ArrowUpRight, MapPin, Film, Car, Coffee, MessageCircle, Sparkles, Code2, Check, Braces, ScanLine, Bug } from 'lucide-react';
import { ResponsiveImage } from '../components/ui/ResponsiveImage';
import { Button } from '../components/ui/Button';
import { SITE } from '../constants';
import { projects } from '../data';
import { useNavStore } from '../store';
import { useAboutMotion } from '../hooks/useAboutMotion';
import '../styles/about.css';

const workflow = [
  { title: 'Plan', detail: 'Understand the problem before deciding what to build.', icon: ScanLine },
  { title: 'Build', detail: 'Connect the interface, the backend, and the data.', icon: Braces },
  { title: 'Review', detail: 'Read the code and take responsibility for the decisions.', icon: Check },
  { title: 'Test & debug', detail: 'Check the behavior, trace the problems, and keep improving.', icon: Bug },
];

const interests = [
  { title: 'Video editing', detail: 'Shaping footage into stories. A creative practice that also includes work for international clients.', icon: Film },
  { title: 'Cars & motorcycles', detail: 'A curiosity that follows me away from the screen.', icon: Car },
  { title: 'Coffee', detail: 'A small pleasure, and a good reason to take a break.', icon: Coffee },
  { title: 'Life & philosophy', detail: 'Conversations about how we live, what matters, and how we make sense of it all.', icon: MessageCircle },
];

export function AboutPage() {
  const root = useAboutMotion();
  const navigate = useNavStore(state => state.navigate);
  const editingPortfolio = projects.find(project => project.id === 6)?.live;

  return (
    <div ref={root} className="page about-page about-editorial">
      <header className="about-masthead">
        <p className="about-kicker"><span className="about-marker" aria-hidden="true" />About the developer</p>
        <span className="about-masthead-note">The person behind the projects</span>
      </header>

      <section className="about-profile" aria-labelledby="about-title">
        <div className="about-profile-copy">
          <h1 id="about-title"><span className="about-title-line">Hey, I'm{' '}</span><span className="about-title-line">{SITE.fullName}<span className="about-title-dot">.</span></span></h1>
          <p className="about-lead" data-about-intro>An AI-assisted full-stack developer, learning by building things that people can use.</p>
          <p className="about-bio" data-about-intro>It started with a simple <span className="about-inline-code">Hello, World!</span> and grew into personal projects I build, use, and keep improving. I enjoy turning complicated problems into practical web and mobile apps.</p>
          <div className="about-profile-actions" data-about-intro>
            <Button variant="primary" rounded onClick={() => navigate('projects')}>Explore my work<ArrowUpRight size={16} aria-hidden="true" /></Button>
            {SITE.resumeUrl && <a className="ui-button ui-button--ghost ui-button--rounded" href={SITE.resumeUrl} download>Download resume<ArrowRight size={15} aria-hidden="true" /></a>}
          </div>
        </div>
        <figure className="about-photo">
          <div className="about-photo-frame"><ResponsiveImage src="/avatar.jpeg" alt={`${SITE.fullName}, the developer behind this portfolio`} sizes="(max-width: 600px) 80vw, (max-width: 1100px) 30vw, 360px" loading="eager" /></div>
          <figcaption><span>{SITE.fullName}</span><span><MapPin size={12} aria-hidden="true" />{SITE.location}</span></figcaption>
        </figure>
      </section>

      <section className="about-stack-strip" aria-label="Development focus" data-about-reveal>
        <span className="about-stack-label"><Code2 size={16} aria-hidden="true" />Across the stack</span>
        <p><span>React & TypeScript</span><span className="about-stack-divider" aria-hidden="true">/</span><span>Node.js & Django</span><span className="about-stack-divider" aria-hidden="true">/</span><span>PostgreSQL</span></p>
        <button type="button" onClick={() => navigate('skills')}>My toolkit<ArrowUpRight size={14} aria-hidden="true" /></button>
      </section>

      <section className="about-method" aria-labelledby="about-method-title">
        <div className="about-method-copy" data-about-reveal>
          <p className="about-kicker"><span className="about-section-number">01</span>Behind the work</p>
          <h2 id="about-method-title">AI assists.<br />I own the decisions.</h2>
          <p>I handle the planning, coding, review, testing, and debugging. On projects like Findify and CoinFession, AI is an assistant throughout that process.</p>
          <p className="about-method-principle"><Sparkles size={15} aria-hidden="true" />Performance. Accessibility. Ease of use.</p>
        </div>
        <div className="about-method-track">
          <div className="about-workflow-rail" aria-hidden="true"><span /></div>
          <ol className="about-workflow-list">
            {workflow.map(({ title, detail, icon: Icon }, index) => <li key={title} className="about-workflow-step">
              <div className="about-workflow-step-inner" data-about-reveal>
                <span className="about-step-number">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{title}</h3><p>{detail}</p></div>
                <Icon size={18} aria-hidden="true" />
              </div>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="about-offline" aria-labelledby="about-offline-title">
        <div className="about-offline-heading" data-about-reveal>
          <div><p className="about-kicker"><span className="about-section-number">02</span>Off the clock</p><h2 id="about-offline-title">Away from the keyboard.</h2></div>
          <p>A few things I make time for.</p>
        </div>
        <div className="about-personal-grid">
          {interests.map(({ title, detail, icon: Icon }, index) => <article key={title} className="about-personal-item" data-about-reveal data-about-order={index % 2}>
            <span className="about-personal-icon"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>
            <div><h3>{title}</h3><p>{detail}</p>
              {index === 0 && editingPortfolio && <a href={editingPortfolio} target="_blank" rel="noopener noreferrer" className="about-editing-link">See my editing work<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
            </div>
          </article>)}
        </div>
      </section>

      <footer className="about-signoff" data-about-reveal>
        <div><p className="about-kicker">Next up</p><h2>Let's build something useful.</h2><p>Have a practical problem or an idea you want to talk through?</p></div>
        <Button rounded onClick={() => navigate('contact')}>Get in touch<ArrowUpRight size={17} aria-hidden="true" /></Button>
      </footer>
    </div>
  );
}

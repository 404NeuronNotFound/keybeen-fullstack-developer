import { MapPin, Film, Car, Coffee, MessageCircle, Sparkles, Code2 } from 'lucide-react';
import { SITE } from '../constants';
import { PageNextStep } from '../components/ui/PageNextStep';

export function AboutPage() {
  return (
    <div className="page about-page">
      <section className="about-intro-panel">
        <figure className="about-portrait">
          <img src="/avatar.jpeg" alt="Keybeen" />
          <figcaption><span>Keybeen</span><span><MapPin size={13} aria-hidden="true" />{SITE.location}</span></figcaption>
        </figure>
        <div className="about-intro-copy">
        <p className="discography-eyebrow">About me</p>
        <h1>Hey, I build things.</h1>
        <p>I'm an <strong>AI-assisted full-stack app and web developer</strong> who enjoys turning complex ideas or problems into practical solutions. My journey started with a simple "Hello, World!" and grew into personal projects I build, use, and keep improving.</p>
        <p>My stack spans both ends: <strong>React and TypeScript</strong> for interfaces, and <strong>Node.js, Django, and PostgreSQL</strong> for backend work. I care about performance, accessibility, and making software easier to use.</p>
        </div>
      </section>
      <section className="about-note-section about-workflow">
        <div className="about-section-heading"><span className="about-section-icon"><Code2 size={20} aria-hidden="true" /></span><div><p className="discography-eyebrow">Behind the work</p><h2>How I work with AI</h2></div></div>
        <p>On projects such as Findify and CoinFession, I handle the planning, coding, review, testing, and debugging. I use AI as an assistant throughout that process, while keeping responsibility for the work and the decisions.</p>
        <ol className="about-process">{['Plan', 'Build', 'Review', 'Test & debug'].map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
        <p className="about-workflow-note"><Sparkles size={14} aria-hidden="true" />AI assists. I own the decisions.</p>
      </section>
      <section className="about-note-section about-interests">
        <div className="about-section-heading"><span className="about-section-icon"><Coffee size={20} aria-hidden="true" /></span><div><p className="discography-eyebrow">A little more personal</p><h2>Outside of technology</h2></div></div>
        <div className="about-interest-grid">
          <article><Film size={22} aria-hidden="true" /><h3>Video Editing</h3><p>My passion: shaping footage into stories. I also edit videos for international clients.</p></article>
          <article><Car size={22} aria-hidden="true" /><h3>Cars & Motorcycles</h3><p>A hobby that keeps my curiosity going beyond the screen.</p></article>
          <article><Coffee size={22} aria-hidden="true" /><h3>Caffeine</h3><p>A small pleasure I enjoy along the way.</p></article>
          <article><MessageCircle size={22} aria-hidden="true" /><h3>Life & Philosophy</h3><p>Conversations about how we live, what matters, and how we make sense of it all.</p></article>
        </div>
      </section>
      {SITE.resumeUrl && <a className="project-reader-button" href={SITE.resumeUrl} download>Download resume</a>}
      <PageNextStep title="Let's build something" description="Have a practical problem or an idea you want to talk through?" page="contact" label="Get in touch" />
    </div>
  );
}

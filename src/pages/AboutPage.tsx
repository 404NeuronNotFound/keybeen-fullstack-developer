import { SITE } from '../constants';
import { PageNextStep } from '../components/ui/PageNextStep';

export function AboutPage() {
  return (
    <div className="page">
      <section className="about-intro-panel">
        <p className="discography-eyebrow">About me</p>
        <h1>Hey, I build things.</h1>
        <p>I'm an <strong>AI-assisted full-stack app and web developer</strong> who enjoys turning complex ideas or problems into practical solutions. My journey started with a simple "Hello, World!" and grew into personal projects I build, use, and keep improving.</p>
        <p>My stack spans both ends: <strong>React and TypeScript</strong> for interfaces, and <strong>Node.js, Django, and PostgreSQL</strong> for backend work. I care about performance, accessibility, and making software easier to use.</p>
      </section>
      <section className="about-note-section">
        <h2>How I work with AI</h2>
        <p>On projects such as Findify and CoinFession, I handle the planning, coding, review, testing, and debugging. I use AI as an assistant throughout that process, while keeping responsibility for the work and the decisions.</p>
      </section>
      <section className="about-note-section">
        <h2>Outside of technology</h2>
        <p><strong>Video editing is my passion.</strong> I love shaping footage into stories, and I also edit videos for international clients. Cars and motorcycles are another hobby of mine.</p>
        <p>I like caffeine and philosophical conversations about life. I'm drawn to questions about how we live, what matters to us, and how we make sense of it all.</p>
      </section>
      {SITE.resumeUrl && <a className="project-reader-button" href={SITE.resumeUrl} download>Download resume</a>}
      <PageNextStep title="Let's build something" description="Have a practical problem or an idea you want to talk through?" page="contact" label="Get in touch" />
    </div>
  );
}

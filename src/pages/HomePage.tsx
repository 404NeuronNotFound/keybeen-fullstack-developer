import { HeroSection, FeaturedProjects } from '../components/sections';
import { PageNextStep } from '../components/ui/PageNextStep';
import { useHomeMotion } from '../hooks/useHomeMotion';
import '../styles/home.css';

export function HomePage() {
  const root = useHomeMotion();
  return (
    <div ref={root} className="home-page">
      <HeroSection />
      <FeaturedProjects />
      <div className="page-x home-outro" data-home-reveal>
        <PageNextStep title="Have an everyday problem worth solving?" description="Tell me what you have in mind. Let's find a useful place to start." page="contact" label="Let's talk" />
        <p className="home-endnote">Made with curiosity. Built by Keybeen.</p>
      </div>
    </div>
  );
}

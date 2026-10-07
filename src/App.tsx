import { useNavStore }                                 from './store';
import { useIsMobile }                                 from './hooks';
import { Sidebar, Topbar, ProjectBar, BottomNav }      from './components/layout';
import { ProjectOverview } from './components/ui/ProjectOverview';
import { ToastViewport } from './components/ui/ToastViewport';
import {
  HomePage,
  AboutPage,
  SkillsPage,
  ExperiencePage,
  ProjectsPage,
  ContactPage,
} from './pages';
import type { SectionId } from './types';
import type { JSX }       from 'react';

// ─── page registry ─────────────────────────────────────────────────────────
// Add a new page here and it instantly appears — no switch statements to update
const PAGE_MAP: Record<SectionId, JSX.Element> = {
  home:       <HomePage />,
  about:      <AboutPage />,
  skills:     <SkillsPage />,
  experience: <ExperiencePage />,
  projects:   <ProjectsPage />,
  contact:    <ContactPage />,
};

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const active   = useNavStore((s) => s.active);
  const isMobile = useIsMobile();

  return (
    <div
      className="app-shell"
      style={{
        background:  'var(--sp-black)',
        color:       'var(--sp-white)',
        display:     'flex',
        overflow:    'hidden',
        fontSize:    14,
        lineHeight:  1.5,
      }}
    >
      {/* ── left sidebar — desktop / tablet only ── */}
      {!isMobile && <Sidebar />}

      {/* ── right column: topbar · scrollable content · playbar · bottom nav ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />

        <main
          role="main"
          style={{ flex: 1, overflowY: 'auto', background: 'var(--sp-dark)', WebkitOverflowScrolling: 'touch' }}
        >
          {PAGE_MAP[active] ?? <HomePage />}
        </main>

        <ProjectBar />

        {/* ── bottom tab bar — mobile only ── */}
        {isMobile && <BottomNav />}
      </div>
      <ToastViewport />
      <ProjectOverview />
    </div>
  );
}

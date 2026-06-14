import { useNavStore }                                 from './store';
import { Sidebar, Topbar, Playbar }                    from './components/layout';
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
  const active = useNavStore((s) => s.active);

  return (
    <div
      style={{
        background:  'var(--sp-black)',
        color:       'var(--sp-white)',
        display:     'flex',
        height:      '100vh',
        overflow:    'hidden',
        fontSize:    14,
        lineHeight:  1.5,
      }}
    >
      {/* ── left sidebar ── */}
      <Sidebar />

      {/* ── right column: topbar · scrollable content · playbar ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />

        <main
          role="main"
          style={{ flex: 1, overflowY: 'auto', background: 'var(--sp-dark)' }}
        >
          {PAGE_MAP[active] ?? <HomePage />}
        </main>

        <Playbar />
      </div>
    </div>
  );
}

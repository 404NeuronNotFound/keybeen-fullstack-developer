import { useNavStore }                                 from './store';
import { subscribeToBrowserNavigation } from './store/navStore';
import { focusPageHeading } from './utils/pageFocus';
import { MotionConfig } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';
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
  const mainRef = useRef<HTMLElement>(null);
  const previousPage = useRef(active);

  useEffect(subscribeToBrowserNavigation, []);
  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = useNavStore.getState().getScrollPosition(active);
      if (previousPage.current !== active) focusPageHeading(mainRef.current);
    }
    previousPage.current = active;
  }, [active]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#main-content" onClick={event => {
          event.preventDefault();
          if (mainRef.current) focusPageHeading(mainRef.current, false);
        }}>Skip to content</a>
        {/* ── left sidebar — desktop / tablet only ── */}
        {!isMobile && <Sidebar />}

        {/* ── right column: topbar · scrollable content · playbar · bottom nav ── */}
        <div className="app-column">
          <Topbar />

          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            className="app-content"
            onScroll={event => useNavStore.getState().recordScroll(active, event.currentTarget.scrollTop)}
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
    </MotionConfig>
  );
}

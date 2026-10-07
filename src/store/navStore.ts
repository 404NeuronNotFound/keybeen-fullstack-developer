import { create } from 'zustand';
import type { SectionId } from '../types';

const SECTIONS: SectionId[] = ['home', 'about', 'skills', 'experience', 'projects', 'contact'];
const HISTORY_KEY = 'portfolioNavigation';
type ScrollPositions = Partial<Record<SectionId, number>>;

interface NavigationSnapshot {
  session: string;
  history: SectionId[];
  histIdx: number;
  scroll: ScrollPositions;
}

interface NavState {
  active: SectionId;
  history: SectionId[];
  histIdx: number;
  navigate: (section: SectionId) => void;
  back: () => void;
  forward: () => void;
  canBack: () => boolean;
  canForward: () => boolean;
  recordScroll: (section: SectionId, top: number) => void;
  getScrollPosition: (section: SectionId) => number;
}

function isSection(value: unknown): value is SectionId {
  return SECTIONS.includes(value as SectionId);
}

function sectionFromHash(): SectionId {
  if (typeof window === 'undefined') return 'home';
  const section = window.location.hash.replace(/^#\/?/, '');
  return isSection(section) ? section : 'home';
}

function readSnapshot(): NavigationSnapshot | null {
  if (typeof window === 'undefined') return null;
  const value = window.history.state?.[HISTORY_KEY] as NavigationSnapshot | undefined;
  if (!value || typeof value.session !== 'string' || !Array.isArray(value.history)
    || !value.history.length || !value.history.every(isSection)
    || !Number.isInteger(value.histIdx) || value.histIdx < 0 || value.histIdx >= value.history.length
    || !value.scroll || typeof value.scroll !== 'object'
    || !Object.entries(value.scroll).every(([key, top]) => isSection(key) && typeof top === 'number' && Number.isFinite(top) && top >= 0)) return null;
  return value;
}

const initialSection = sectionFromHash();
const saved = readSnapshot();
const initial = saved?.history[saved.histIdx] === initialSection ? saved : null;
let session = initial?.session ?? `${Date.now()}-${Math.random()}`;
const scrollPositions: ScrollPositions = { ...initial?.scroll };

function writeHistory(mode: 'pushState' | 'replaceState', state: Pick<NavState, 'active' | 'history' | 'histIdx'>) {
  if (typeof window === 'undefined') return;
  const snapshot: NavigationSnapshot = { session, history: state.history, histIdx: state.histIdx, scroll: { ...scrollPositions } };
  window.history[mode]({ ...window.history.state, [HISTORY_KEY]: snapshot }, '', `#/${state.active}`);
}

function captureScroll() {
  if (typeof document === 'undefined') return;
  const main = document.querySelector('main');
  if (main) scrollPositions[useNavStore.getState().active] = main.scrollTop;
}

export const useNavStore = create<NavState>((set, get) => ({
  active: initialSection,
  history: initial?.history ?? [initialSection],
  histIdx: initial?.histIdx ?? 0,

  navigate: (section) => {
    const current = get();
    if (!isSection(section) || current.active === section) return;
    captureScroll();
    writeHistory('replaceState', current);
    const history = [...current.history.slice(0, current.histIdx + 1), section];
    const next = { active: section, history, histIdx: history.length - 1 };
    writeHistory('pushState', next);
    set(next);
  },

  back: () => {
    const current = get();
    if (current.histIdx <= 0) return;
    captureScroll();
    if (typeof window !== 'undefined') {
      writeHistory('replaceState', current);
      window.history.back();
    } else set({ histIdx: current.histIdx - 1, active: current.history[current.histIdx - 1] });
  },

  forward: () => {
    const current = get();
    if (current.histIdx >= current.history.length - 1) return;
    captureScroll();
    if (typeof window !== 'undefined') {
      writeHistory('replaceState', current);
      window.history.forward();
    } else set({ histIdx: current.histIdx + 1, active: current.history[current.histIdx + 1] });
  },

  canBack: () => get().histIdx > 0,
  canForward: () => get().histIdx < get().history.length - 1,
  recordScroll: (section, top) => {
    if (Number.isFinite(top) && top >= 0) scrollPositions[section] = top;
  },
  getScrollPosition: (section) => scrollPositions[section] ?? 0,
}));

/** Connect native Back/Forward and manually entered hash routes to the store. */
export function subscribeToBrowserNavigation() {
  if (typeof window === 'undefined') return () => {};
  const sync = () => {
    const current = useNavStore.getState();
    const active = sectionFromHash();
    const snapshot = readSnapshot();
    // A history traversal can emit both events. Do not capture the outgoing
    // DOM's scroll position again after the store has already changed pages.
    if (snapshot?.session === session && current.active === active && current.histIdx === snapshot.histIdx) return;
    captureScroll();
    if (snapshot && snapshot.history[snapshot.histIdx] === active) {
      const history = snapshot.session === session && current.history[snapshot.histIdx] === active
        ? current.history : snapshot.history;
      session = snapshot.session;
      useNavStore.setState({ active, history, histIdx: snapshot.histIdx });
    } else if (active !== current.active) {
      const history = [...current.history.slice(0, current.histIdx + 1), active];
      useNavStore.setState({ active, history, histIdx: history.length - 1 });
    }
    // Update the destination's snapshot too, so refreshing after Back retains Forward.
    writeHistory('replaceState', useNavStore.getState());
  };
  const save = () => {
    captureScroll();
    writeHistory('replaceState', useNavStore.getState());
  };
  const previousScrollRestoration = window.history.scrollRestoration;
  window.history.scrollRestoration = 'manual';
  // Initial state already follows the URL; register this browser entry without adding one.
  writeHistory('replaceState', useNavStore.getState());
  window.addEventListener('popstate', sync);
  window.addEventListener('hashchange', sync);
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
  return () => {
    save();
    window.removeEventListener('popstate', sync);
    window.removeEventListener('hashchange', sync);
    window.removeEventListener('pagehide', save);
    window.removeEventListener('beforeunload', save);
    window.history.scrollRestoration = previousScrollRestoration;
  };
}

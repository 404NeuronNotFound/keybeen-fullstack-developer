import { create } from 'zustand';
import type { SectionId } from '../types';

interface NavState {
  active:  SectionId;
  history: SectionId[];
  histIdx: number;
  navigate:    (section: SectionId) => void;
  back:        () => void;
  forward:     () => void;
  canBack:     () => boolean;
  canForward:  () => boolean;
}

export const useNavStore = create<NavState>((set, get) => ({
  active:  'home',
  history: ['home'],
  histIdx: 0,

  navigate: (section) => {
    const { history, histIdx } = get();
    const newHistory = [...history.slice(0, histIdx + 1), section];
    set({ active: section, history: newHistory, histIdx: newHistory.length - 1 });
  },

  back: () => {
    const { histIdx, history } = get();
    if (histIdx > 0) set({ histIdx: histIdx - 1, active: history[histIdx - 1] });
  },

  forward: () => {
    const { histIdx, history } = get();
    if (histIdx < history.length - 1)
      set({ histIdx: histIdx + 1, active: history[histIdx + 1] });
  },

  canBack:    () => get().histIdx > 0,
  canForward: () => get().histIdx < get().history.length - 1,
}));

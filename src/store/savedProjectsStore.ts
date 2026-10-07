import { create } from 'zustand';
import { projects } from '../data';

const STORAGE_KEY = 'keybeen-saved-projects';
const validId = (id: unknown): id is number => typeof id === 'number' && projects.some(project => project.id === id);

function readSaved(): number[] {
  try {
    if (typeof window === 'undefined') return [];
    const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? [...new Set(saved.filter(validId))] : [];
  } catch {
    return [];
  }
}

interface SavedProjectsState {
  savedProjectIds: number[];
  toggleSaved: (id: number) => void;
}

export const useSavedProjectsStore = create<SavedProjectsState>((set, get) => ({
  savedProjectIds: readSaved(),
  toggleSaved: id => {
    if (!validId(id)) return;
    const current = get().savedProjectIds;
    const savedProjectIds = current.includes(id) ? current.filter(savedId => savedId !== id) : [...current, id];
    set({ savedProjectIds });
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProjectIds));
    } catch { /* Saving remains usable during this visit when storage is unavailable. */ }
  },
}));

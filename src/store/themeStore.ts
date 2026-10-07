import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme:       Theme;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'keybeen-theme';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) as { state?: { theme?: unknown } } | null : null;
    const theme = saved?.state?.theme;
    return theme === 'light' || theme === 'dark' ? theme : 'dark';
  } catch {
    // Corrupt data or blocked storage must not prevent the app from loading.
    return 'dark';
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readTheme(),
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme });
    applyTheme(theme);
    try {
      // Retain the existing saved-preference format for returning visitors.
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { theme }, version: 0 }));
      }
    } catch {
      // Keep the selected theme usable in memory when saving is unavailable.
    }
  },
}));

/** Adds/removes the `data-theme="light"` attribute on <html> */
function applyTheme(theme: Theme) {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', theme);
}

// Apply on first load (before React mounts) to avoid flash
applyTheme(useThemeStore.getState().theme);

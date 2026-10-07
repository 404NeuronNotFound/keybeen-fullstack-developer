import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  muted:       boolean;
  musicOptedIn: boolean;
  toggleMuted: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: true, // muted by default — opt-in, never surprise the user

      // Require a speaker-button opt-in each visit, even with a saved preference.
      musicOptedIn: false,
      toggleMuted: () => {
        const muted = !(get().muted || !get().musicOptedIn);
        set({ muted, musicOptedIn: !muted });
      },
    }),
    {
      name: 'keybeen-sound', // localStorage key
      partialize: (state) => ({ muted: state.muted }),
    }
  )
);

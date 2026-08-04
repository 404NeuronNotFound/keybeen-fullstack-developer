import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  muted:       boolean;
  toggleMuted: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      muted: true, // muted by default — opt-in, never surprise the user

      toggleMuted: () => set({ muted: !get().muted }),
    }),
    {
      name: 'keybeen-sound', // localStorage key
    }
  )
);
import { create } from 'zustand';
import { projects }                    from '../data';
import { clamp, progressToTime }       from '../utils';
import { PLAYER_TICK, PLAYER_STEP }    from '../constants';
import type { Project }                from '../types';

let _interval: ReturnType<typeof setInterval> | null = null;

interface PlayerState {
  isPlaying:    boolean;
  currentTrack: Project;
  /** 0 – 100 */
  progress:     number;
  /** 0 – 100 */
  volume:       number;
  liked:        Set<number>;
  shuffled:     boolean;
  repeated:     boolean;

  // helpers
  getCurrentTime: () => string;

  // actions
  play:          (track?: Project) => void;
  pause:         () => void;
  toggle:        () => void;
  skipForward:   () => void;
  skipBack:      () => void;
  seek:          (pct: number) => void;
  setVolume:     (v: number) => void;
  toggleLike:    (id: number) => void;
  toggleShuffle: () => void;
  toggleRepeat:  () => void;

  // internal
  _skip:      (dir: 1 | -1) => void;
  _startTick: () => void;
  _stopTick:  () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying:    false,
  currentTrack: projects[0],
  progress:     22,
  volume:       72,
  liked:        new Set<number>(),
  shuffled:     false,
  repeated:     false,

  getCurrentTime: () => {
    const { progress, currentTrack } = get();
    return progressToTime(progress, currentTrack.duration);
  },

  play: (track) => {
    const { currentTrack } = get();
    if (track && track.id !== currentTrack.id) set({ currentTrack: track, progress: 0 });
    set({ isPlaying: true });
    get()._startTick();
  },

  pause: () => {
    set({ isPlaying: false });
    get()._stopTick();
  },

  toggle: () => (get().isPlaying ? get().pause() : get().play()),

  skipForward: () => get()._skip(1),
  skipBack:    () => get()._skip(-1),

  seek:      (pct) => set({ progress: clamp(pct) }),
  setVolume: (v)   => set({ volume: clamp(v) }),

  toggleLike: (id) =>
    set((state) => {
      const liked = new Set(state.liked);
      liked.has(id) ? liked.delete(id) : liked.add(id);
      return { liked };
    }),

  toggleShuffle: () => set((s) => ({ shuffled: !s.shuffled })),
  toggleRepeat:  () => set((s) => ({ repeated: !s.repeated })),

  _skip: (dir) => {
    const { currentTrack, shuffled } = get();
    const idx  = projects.findIndex((p) => p.id === currentTrack.id);
    const next = shuffled
      ? projects[Math.floor(Math.random() * projects.length)]
      : projects[(idx + dir + projects.length) % projects.length];
    set({ currentTrack: next, progress: 0, isPlaying: true });
    get()._startTick();
  },

  _startTick: () => {
    if (_interval) clearInterval(_interval);
    _interval = setInterval(() => {
      const { progress, repeated, isPlaying } = get();
      if (!isPlaying) return;
      if (progress >= 100) {
        repeated ? set({ progress: 0 }) : (set({ isPlaying: false, progress: 100 }), clearInterval(_interval!));
        return;
      }
      set({ progress: clamp(+(progress + PLAYER_STEP).toFixed(3)) });
    }, PLAYER_TICK);
  },

  _stopTick: () => { if (_interval) clearInterval(_interval); },
}));

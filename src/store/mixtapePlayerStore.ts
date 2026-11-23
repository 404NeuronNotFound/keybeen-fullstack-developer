import { create } from 'zustand';
import type { MixtapeVideo } from '../types/mixtape';

interface MixtapePlayer {
  video: MixtapeVideo | null; queue: MixtapeVideo[];
  play: (video: MixtapeVideo, queue?: MixtapeVideo[]) => void;
  next: () => void; previous: () => void; stop: () => void;
}
export const useMixtapePlayerStore = create<MixtapePlayer>((set, get) => ({
  video: null, queue: [],
  play: (video, queue = [video]) => {
    set({ video, queue });
  },
  next: () => { const { video, queue } = get(); const index = queue.findIndex(item => item.videoId === video?.videoId); if (index >= 0 && index < queue.length - 1) set({ video: queue[index + 1] }); },
  previous: () => { const { video, queue } = get(); const index = queue.findIndex(item => item.videoId === video?.videoId); if (index > 0) set({ video: queue[index - 1] }); },
  stop: () => set({ video: null, queue: [] }),
}));

import { useSoundStore } from '../store/soundStore';

interface MutablePlayer { mute: () => void; unMute: () => void }

export function applyPlayerMute(player: MutablePlayer) {
  const { muted, musicOptedIn } = useSoundStore.getState();
  if (muted || !musicOptedIn) player.mute();
  else player.unMute();
}

/** Subscribe only after the iframe is ready; never rebuild it for a mute toggle. */
export function bindPlayerMute(player: MutablePlayer) {
  applyPlayerMute(player);
  return useSoundStore.subscribe(() => applyPlayerMute(player));
}

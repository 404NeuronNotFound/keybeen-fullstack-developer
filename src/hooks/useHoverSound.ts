import { useCallback, useRef } from 'react';
import { useSoundStore } from '../store';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext();
    // TEMP DEBUG: exposes the app's real AudioContext on window so you can
    // inspect it from DevTools console with `window.__hoverAudioCtx.state`
    // instead of accidentally creating an unrelated context. Remove this
    // line once sound is confirmed working.
    (window as any).__hoverAudioCtx = sharedCtx;
  }
  return sharedCtx;
}

/**
 * IMPORTANT: browsers keep AudioContext in a `suspended` state until it is
 * resumed inside a *real* user gesture handler (a click/tap). A `mouseenter`
 * from hovering a card does NOT count as a gesture, so calling resume()
 * lazily inside the hover handler silently does nothing on first load.
 *
 * Call this directly inside your mute/unmute button's onClick — that click
 * is a genuine gesture and will permanently unlock audio for the rest of
 * the session. After that, hover sounds will play normally.
 */
export function primeAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  // Play a silent, near-zero-gain blip. On some browsers (notably iOS
  // Safari) resume() alone isn't enough to fully unlock — actually
  // starting a node during the gesture is what finishes the unlock.
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
}

/**
 * Plays a soft synthesized tick. `variant` lets different
 * interactions have a subtly different pitch/character.
 */
export function useHoverSound() {
  const muted = useSoundStore((s) => s.muted);
  const lastPlayed = useRef(0);

  const play = useCallback(
    (variant: 'hover' | 'click' = 'hover') => {
      if (muted) return;

      const ctx = getCtx();
      // If the context is still suspended here, the user hasn't clicked
      // the unmute toggle yet this session (or is on a browser that needs
      // it) — bail quietly rather than throwing.
      if (ctx.state !== 'running') return;

      // debounce — prevents a buzzy noise when rapidly hovering across a grid
      const now = performance.now();
      if (now - lastPlayed.current < 60) return;
      lastPlayed.current = now;

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = variant === 'click' ? 880 : 660;

      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      // TEMP: bumped up from 0.08/0.05 to 0.35/0.25 and duration from
      // 0.12/0.08 to 0.25/0.18 so it's unmistakable while testing. Once
      // confirmed audible, dial these back down to taste — anything
      // above ~0.1 will start to feel loud/annoying in normal use.
      gain.gain.linearRampToValueAtTime(variant === 'click' ? 0.35 : 0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (variant === 'click' ? 0.25 : 0.18));

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    },
    [muted]
  );

  return play;
}
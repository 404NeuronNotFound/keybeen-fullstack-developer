import { useCallback, useRef } from 'react';
import { useSoundStore } from '../store';

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
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
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.01);
}

/**
 * Plays a short synthesized digital-glitch burst: a noisy static hiss plus
 * a few rapid, randomly-pitched square-wave "stutter" blips layered on top.
 * Gated by the same muted/ctx-running checks as the hover tick.
 */
function playGlitchBurst(ctx: AudioContext) {
  const t = ctx.currentTime;

  // static/noise burst
  const bufferSize = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const decay = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * decay * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  noise.connect(noiseGain).connect(ctx.destination);
  noise.start(t);

  // a handful of short, randomly-pitched digital stutter blips
  const blipCount = 4;
  for (let i = 0; i < blipCount; i++) {
    const blipStart = t + i * 0.035 + Math.random() * 0.015;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 200 + Math.random() * 900;
    gain.gain.setValueAtTime(0, blipStart);
    gain.gain.linearRampToValueAtTime(0.06, blipStart + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, blipStart + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(blipStart);
    osc.stop(blipStart + 0.04);
  }
}

/**
 * Plays a soft synthesized tick. `variant` lets different
 * interactions have a subtly different pitch/character.
 */
export function useHoverSound() {
  const muted = useSoundStore((s) => s.muted);
  const lastPlayed = useRef(0);

  const play = useCallback(
    (variant: 'hover' | 'click' | 'glitch' = 'hover') => {
      if (muted) return;

      const ctx = getCtx();
      if (ctx.state !== 'running') return;

      // debounce — prevents a buzzy noise when rapidly hovering across a grid
      const now = performance.now();
      if (now - lastPlayed.current < 60) return;
      lastPlayed.current = now;

      if (variant === 'glitch') {
        playGlitchBurst(ctx);
        return;
      }

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = variant === 'click' ? 880 : 660;

      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(variant === 'click' ? 0.12 : 0.08, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (variant === 'click' ? 0.16 : 0.11));

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    },
    [muted]
  );

  return play;
}
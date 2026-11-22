import { useEffect, useRef } from 'react';

const CHARACTERS = '01010101{}[]<>/;=+';
const hash = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

/** Decorative code field; the scanning effect never touches the portrait. */
export function IntroCodeScan() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext('2d');
    if (!surface || !context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const background = document.createElement('canvas');
    const backdrop = background.getContext('2d');
    if (!backdrop) return;
    let width = 0, height = 0, font = 12, column = 10, row = 19;
    let frame = 0, lastDraw = 0;
    const started = performance.now();
    let disposed = false;

    const resize = () => {
      const bounds = surface.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = background.width = Math.max(1, Math.round(width * ratio));
      surface.height = background.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      backdrop.setTransform(ratio, 0, 0, ratio, 0, 0);
      font = width < 600 ? 10 : 12; column = font * 0.85; row = font * 1.6;
      backdrop.font = `${font}px ui-monospace, SFMono-Regular, Consolas, monospace`;
      backdrop.fillStyle = '#253e2e';
      for (let y = 0; y < height / row; y++) for (let x = 0; x < width / column; x++) {
        const value = hash(x, y);
        if (value % 4 === 0) backdrop.fillText(CHARACTERS[value % CHARACTERS.length], x * column, y * row);
      }
      lastDraw = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      // Cache the full background; redraw only the narrow active scan band.
      if (time - lastDraw >= 70) {
        lastDraw = time;
        const scan = ((time - started) % 1800) / 1800 * (height + 80) - 40;
        context.clearRect(0, 0, width, height);
        context.drawImage(background, 0, 0, width, height);
        context.font = `${font}px ui-monospace, SFMono-Regular, Consolas, monospace`;
        for (let y = Math.max(0, Math.floor((scan - 38) / row)); y <= Math.ceil((scan + 38) / row); y++) {
          const light = Math.max(0, 1 - Math.abs(y * row - scan) / 40);
          context.fillStyle = `rgba(70,220,125,${light * 0.65})`;
          for (let x = 0; x < width / column; x++) {
            if (hash(x, y) % 3 === 0) context.fillText(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)], x * column, y * row);
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(tick); };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    document.addEventListener('visibilitychange', onVisibility);
    resize(); wake();
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvas} className="entry-code-scan" aria-hidden="true" />;
}

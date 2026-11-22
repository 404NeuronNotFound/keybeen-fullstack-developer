import { useEffect, useRef, useState } from 'react';
import { createCodePortrait } from '../../utils/codePortrait';
import '../../styles/code-portrait.css';

export function InteractiveCodePortrait({ src, name, decorative = false, resolution = 64 }: { src: string; name: string; decorative?: boolean; resolution?: number }) {
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof createCodePortrait>>(null);
  const [ready, setReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const picture = image.current, surface = canvas.current;
    if (!picture || !surface) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const initialize = () => {
      engine.current?.dispose(); engine.current = null;
      setReady(false); setMotionAllowed(!preference.matches);
      if (!picture.complete || !picture.naturalWidth) return;
      try {
        engine.current = createCodePortrait(surface, picture, !preference.matches, resolution);
        setReady(engine.current !== null);
      } catch { /* Keep the source artwork if canvas is unavailable. */ }
    };
    picture.addEventListener('load', initialize);
    preference.addEventListener('change', initialize);
    initialize();
    return () => {
      picture.removeEventListener('load', initialize);
      preference.removeEventListener('change', initialize);
      engine.current?.dispose(); engine.current = null;
    };
  }, [src, resolution]);

  const artwork = <>
    <img ref={image} src={src} alt="" className="code-portrait-fallback" loading="eager" decoding="async" fetchPriority={decorative ? 'high' : 'auto'} />
    <canvas ref={canvas} aria-hidden="true" />
  </>;
  if (decorative) return <div className="code-portrait" data-ready={ready} data-decorative="true" aria-hidden="true">{artwork}</div>;

  return <button type="button" className="code-portrait" data-ready={ready} disabled={!ready || !motionAllowed}
    aria-label={ready && motionAllowed ? `Scramble code in ${name}'s portrait` : `Code-art portrait of ${name}`}
    onPointerMove={event => { if (event.pointerType !== 'touch') engine.current?.move(event.clientX, event.clientY); }}
    onPointerLeave={() => engine.current?.leave()} onBlur={() => engine.current?.leave()}
    onClick={event => event.detail === 0 ? engine.current?.ripple() : engine.current?.ripple(event.clientX, event.clientY)}>
    {artwork}
  </button>;
}

interface Glyph {
  homeX: number; homeY: number; x: number; y: number;
  vx: number; vy: number; color: number; glyph: number; original: number; heat: number;
}

const CHARACTERS = '01010101{}[]<>/;=+';
const seed = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

/** Cache character sprites once, then animate their positions and contents. */
export function createCodePortrait(canvas: HTMLCanvasElement, image: HTMLImageElement, motion = true, columns = 64) {
  const SIZE = Math.max(24, Math.min(96, Math.round(columns) || 64));
  const context = canvas.getContext('2d');
  const sample = document.createElement('canvas');
  sample.width = sample.height = SIZE;
  const sampling = sample.getContext('2d', { willReadFrequently: true });
  if (!context || !sampling) return null;
  sampling.drawImage(image, 0, 0, SIZE, SIZE);
  const data = sampling.getImageData(0, 0, SIZE, SIZE).data;
  const colors = Array.from({ length: 13 }, (_, index) => {
    const value = Math.min(255, index * 22);
    return `rgb(${value},${value},${value})`;
  });
  colors.push('#1ed760');
  const glyphs: Glyph[] = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const offset = (y * SIZE + x) * 4;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const light = r * 0.2126 + g * 0.7152 + b * 0.0722;
    if (light < 34) continue;
    // Lift midtones and use bolder characters so the face remains legible.
    const brightness = 48 + 207 * Math.pow(light / 255, 0.7);
    const color = g > r * 1.35 && g > b * 1.2 ? 13 : Math.min(12, Math.round(brightness / 22));
    const original = seed(x, y) % CHARACTERS.length;
    glyphs.push({ homeX: x + 0.5, homeY: y + 0.5, x: x + 0.5, y: y + 0.5, vx: 0, vy: 0, color, original, glyph: original, heat: 0 });
  }

  const atlas = document.createElement('canvas');
  const background = document.createElement('canvas');
  let tile = 1;
  let frame = 0;
  let previousTime = 0;
  let lastShuffle = 0;
  let ambientTime = 0;
  let shuffleStep = 0;
  let pointer: { x: number; y: number } | null = null;
  let burst: { x: number; y: number; time: number } | null = null;
  let disposed = false;
  let onScreen = true;
  const canAnimate = () => motion && onScreen && !document.hidden && !disposed;

  const draw = () => {
    const scale = canvas.width / SIZE;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.drawImage(background, 0, 0, SIZE, SIZE);
    if (motion) {
      context.fillStyle = 'rgba(29,185,84,0.2)';
      context.fillRect(0, (ambientTime % 4800) / 4800 * (SIZE + 8) - 4, SIZE, 0.22);
    }
    for (const glyph of glyphs) {
      const color = glyph.heat > 0.25 && glyph.glyph % 3 === 0 ? 13 : glyph.color;
      context.drawImage(atlas, glyph.glyph * tile, color * tile, tile, tile, glyph.x - 0.5, glyph.y - 0.5, 1, 1);
    }
  };

  const rest = () => {
    cancelAnimationFrame(frame);
    frame = 0; pointer = null; burst = null; previousTime = 0;
    for (const glyph of glyphs) {
      glyph.x = glyph.homeX; glyph.y = glyph.homeY; glyph.vx = glyph.vy = glyph.heat = 0; glyph.glyph = glyph.original;
    }
    draw();
  };

  const tick = (time: number) => {
    frame = 0;
    if (!canAnimate()) return;
    const step = previousTime ? Math.min(2, Math.max(0.5, (time - previousTime) / 16.667)) : 1;
    previousTime = time;
    ambientTime += step * 16.667;
    if (burst && time - burst.time > 700) burst = null;
    const shuffle = time - lastShuffle > 90;
    if (shuffle) { lastShuffle = time; shuffleStep++; }
    const buildRow = (ambientTime % 4800) / 4800 * (SIZE + 8) - 4;
    let moving = false;
    for (const glyph of glyphs) {
      const buildDistance = Math.abs(glyph.homeY - buildRow);
      let heat = Math.max(0, 1 - buildDistance / 3) * 0.5;
      if (pointer) {
        const dx = glyph.x - pointer.x, dy = glyph.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const pointerHeat = Math.max(0, 1 - distance / 15);
        heat = Math.max(heat, pointerHeat);
        if (distance < 15) {
          const force = pointerHeat * 0.3 * step;
          glyph.vx += (distance ? dx / distance : 1) * force;
          glyph.vy += (distance ? dy / distance : 0) * force;
        }
      }
      if (burst) {
        const radius = (time - burst.time) / 12;
        const ringDistance = Math.abs(Math.hypot(glyph.homeX - burst.x, glyph.homeY - burst.y) - radius);
        heat = Math.max(heat, Math.max(0, 1 - ringDistance / 5));
      }
      const ambientGroup = seed(Math.floor(glyph.homeX), Math.floor(glyph.homeY)) % 13;
      if (shuffle && (heat > 0.1 || ambientGroup === shuffleStep % 13)) {
        // Keep a constant silhouette while different groups of code rebuild.
        glyph.glyph = (glyph.glyph + 1 + Math.floor(Math.random() * (CHARACTERS.length - 1))) % CHARACTERS.length;
      }
      glyph.heat += (heat - glyph.heat) * 0.2 * step;
      glyph.vx = (glyph.vx + (glyph.homeX - glyph.x) * 0.045 * step) * Math.pow(0.82, step);
      glyph.vy = (glyph.vy + (glyph.homeY - glyph.y) * 0.045 * step) * Math.pow(0.82, step);
      glyph.x += glyph.vx * step; glyph.y += glyph.vy * step;
      if (Math.abs(glyph.vx) + Math.abs(glyph.vy) > 0.004 || Math.abs(glyph.x - glyph.homeX) + Math.abs(glyph.y - glyph.homeY) > 0.025) moving = true;
    }
    // Ambient changes redraw at about 11 Hz; pointer movement stays smooth.
    if (moving || shuffle) draw();
    frame = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (canAnimate() && !frame) { previousTime = 0; frame = requestAnimationFrame(tick); }
  };
  const position = (clientX: number, clientY: number) => {
    const bounds = canvas.getBoundingClientRect();
    return { x: (clientX - bounds.left) / Math.max(1, bounds.width) * SIZE, y: (clientY - bounds.top) / Math.max(1, bounds.height) * SIZE };
  };
  const resize = () => {
    const width = canvas.getBoundingClientRect().width;
    canvas.width = canvas.height = Math.max(1, Math.round(width * Math.min(window.devicePixelRatio || 1, 2)));
    tile = Math.max(2, Math.ceil(canvas.width / SIZE) * 2);
    atlas.width = CHARACTERS.length * tile; atlas.height = colors.length * tile;
    const sprites = atlas.getContext('2d');
    const backdrop = background.getContext('2d');
    if (!sprites || !backdrop) return;
    sprites.font = `600 ${tile}px ui-monospace, SFMono-Regular, Consolas, monospace`;
    sprites.textAlign = 'center'; sprites.textBaseline = 'middle';
    colors.forEach((color, row) => {
      sprites.fillStyle = color;
      for (let index = 0; index < CHARACTERS.length; index++) sprites.fillText(CHARACTERS[index], (index + 0.5) * tile, (row + 0.5) * tile);
    });
    background.width = background.height = canvas.width;
    const scale = canvas.width / SIZE;
    backdrop.setTransform(scale, 0, 0, scale, 0, 0);
    backdrop.fillStyle = '#090b0a'; backdrop.fillRect(0, 0, SIZE, SIZE);
    backdrop.font = '1px ui-monospace, SFMono-Regular, Consolas, monospace';
    backdrop.textAlign = 'center'; backdrop.textBaseline = 'middle'; backdrop.fillStyle = '#25352b';
    for (let y = 0; y < SIZE; y += 2) for (let x = 0; x < SIZE; x++) {
      backdrop.fillText(CHARACTERS[seed(x, y) % CHARACTERS.length], x + 0.5, y + 0.5);
    }
    draw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const visibility = new IntersectionObserver(entries => {
    onScreen = entries[0]?.isIntersecting ?? false;
    if (onScreen) wake(); else rest();
  });
  visibility.observe(canvas);
  const onVisibility = () => { if (document.hidden) rest(); else wake(); };
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  wake();

  return {
    move(clientX: number, clientY: number) { if (canAnimate()) { pointer = position(clientX, clientY); wake(); } },
    leave() { pointer = null; wake(); },
    ripple(clientX?: number, clientY?: number) {
      if (!canAnimate()) return;
      const center = clientX === undefined || clientY === undefined ? { x: SIZE / 2, y: SIZE / 2 } : position(clientX, clientY);
      burst = { ...center, time: performance.now() };
      for (const glyph of glyphs) {
        const dx = glyph.x - center.x, dy = glyph.y - center.y;
        const distance = Math.max(0.5, Math.hypot(dx, dy));
        const force = 2.2 * Math.exp(-distance / 26);
        glyph.vx += dx / distance * force; glyph.vy += dy / distance * force;
      }
      wake();
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame);
      observer.disconnect(); visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

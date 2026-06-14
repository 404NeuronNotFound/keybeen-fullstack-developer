/** Format total seconds as "m:ss" */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  return `${m}:${s}`;
}

/** Convert a "m:ss" duration string to total seconds */
export function durationToSeconds(duration: string): number {
  const [m, s] = duration.split(':').map(Number);
  return m * 60 + s;
}

/** Given a progress percentage (0-100) and a duration string, return "m:ss" */
export function progressToTime(pct: number, duration: string): string {
  const total   = durationToSeconds(duration);
  const current = (pct / 100) * total;
  return formatTime(current);
}

/** Clamp a number between min and max */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Merge class names (tiny clsx alternative) */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

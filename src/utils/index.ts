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

/** Return an absolute web URL, or omit an unavailable/placeholder project link. */
export function getProjectUrl(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    // Missing URLs and placeholders should not become visitor actions.
  }
  return undefined;
}

/** Merge class names (tiny clsx alternative) */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface ContributionLike {
  date:  string;
  count: number;
}

interface ContributionStats {
  currentStreak: number;
  longestStreak: number;
  bestDay: { date: string; count: number } | null;
}

/** Derive streak + "best day" stats from a chronological list of contribution days */
export function computeContributionStats(days: ContributionLike[]): ContributionStats {
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0, bestDay: null };

  let longest = 0;
  let running = 0;
  let best: ContributionLike = days[0];

  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
    if (day.count > best.count) best = day;
  }

  // current streak = consecutive active days counting back from the most recent
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current += 1;
    else break;
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    bestDay: best.count > 0 ? { date: best.date, count: best.count } : null,
  };
}

/** Format a calendar date ("YYYY-MM-DD") as "Mon D" without timezone shifts. */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

import { type ContributionDay } from '../hooks/useGithubContributions';

export interface ContributionData { days: ContributionDay[]; total: number }
const CACHE_MS = 30 * 60 * 1000;
const memory = new Map<string, { expires: number; data: ContributionData }>();

export function validateContributions(value: unknown): ContributionData {
  if (!value || typeof value !== 'object' || !('contributions' in value) || !Array.isArray(value.contributions) || value.contributions.length > 400) throw new Error('Invalid contribution response');
  const days: ContributionDay[] = value.contributions.map((day: unknown) => {
    if (!day || typeof day !== 'object') throw new Error('Invalid contribution day');
    const { date, count, level } = day as ContributionDay;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || !Number.isSafeInteger(count) || count < 0 || !Number.isInteger(level) || level < 0 || level > 4) throw new Error('Invalid contribution day');
    return { date, count, level };
  }).sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== 86400000) throw new Error('Contribution dates must be consecutive');
  }
  const total = days.reduce((sum, day) => sum + day.count, 0);
  if (!Number.isSafeInteger(total)) throw new Error('Invalid contribution total');
  return { days, total };
}

export function cachedContributions(username: string): ContributionData | null {
  const key = username.toLowerCase();
  let entry = memory.get(key);
  if (!entry) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(`github-contributions:${key}`) ?? 'null');
      if (stored && Number.isFinite(stored.expires) && stored.expires > Date.now() && stored.expires <= Date.now() + CACHE_MS) {
        entry = { expires: stored.expires, data: validateContributions({ contributions: stored.data?.days }) };
        memory.set(key, entry);
      }
    } catch { /* Storage is optional; malformed cache never prevents rendering. */ }
  }
  return entry && entry.expires > Date.now() ? entry.data : null;
}

export async function fetchContributions(username: string, signal: AbortSignal, force = false): Promise<ContributionData> {
  if (signal.aborted) throw new Error('Request cancelled');
  const cached = force ? null : cachedContributions(username);
  if (cached) return cached;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 8000);
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, { signal: controller.signal });
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
    const data = validateContributions(await response.json());
    if (controller.signal.aborted) throw new Error('Request cancelled or timed out');
    const entry = { expires: Date.now() + CACHE_MS, data };
    if (memory.size >= 8) memory.delete(memory.keys().next().value!);
    memory.set(username.toLowerCase(), entry);
    try { sessionStorage.setItem(`github-contributions:${username.toLowerCase()}`, JSON.stringify(entry)); } catch { /* Keep the in-memory cache when storage is blocked. */ }
    return data;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}

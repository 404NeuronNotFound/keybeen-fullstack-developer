import { useCallback, useEffect, useState } from 'react';
import { cachedContributions, fetchContributions } from '../utils/githubContributions';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function useGithubContributions(username: string) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(() => {
    const cached = cachedContributions(username);
    return { username, days: cached?.days ?? [], total: cached?.total ?? 0, loading: !cached, error: false };
  });
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setResult(previous => ({ ...previous, username, loading: true, error: false, ...(previous.username !== username ? { days: [], total: 0 } : {}) }));
      try {
        const data = await fetchContributions(username, controller.signal, attempt > 0);
        if (!controller.signal.aborted) setResult({ username, ...data, loading: false, error: false });
      } catch {
        if (!controller.signal.aborted) setResult(previous => ({ ...previous, loading: false, error: true }));
      }
    }
    void load();
    return () => controller.abort();
  }, [username, attempt]);
  const current = result.username === username ? result : { days: [], total: 0, loading: true, error: false };
  return { ...current, retry };
}

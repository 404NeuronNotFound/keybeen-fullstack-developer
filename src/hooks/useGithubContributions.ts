import { useEffect, useState } from 'react';

export interface ContributionDay {
  date:  string; // "YYYY-MM-DD"
  count: number;
  /** 0 (none) – 4 (most active), as classified by the API */
  level: 0 | 1 | 2 | 3 | 4;
}

interface UseGithubContributionsResult {
  days:    ContributionDay[];
  total:   number;
  loading: boolean;
  /** true if the request failed or the user has no public contributions */
  error:   boolean;
}

/**
 * Fetches the last 12 months of GitHub contribution data for `username`
 * via the public github-contributions-api (no auth/token required).
 */
export function useGithubContributions(username: string): UseGithubContributionsResult {
  const [days, setDays]       = useState<ContributionDay[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        const contributions: ContributionDay[] = data?.contributions ?? [];
        const totalCount: number = data?.total?.lastYear ?? contributions.reduce((sum, d) => sum + d.count, 0);

        if (!cancelled) {
          setDays(contributions);
          setTotal(totalCount);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [username]);

  return { days, total, loading, error };
}
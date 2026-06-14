import { useState, useEffect } from 'react';
import { projects }            from '../data';
import { NOW_CODING_INTERVAL } from '../constants';

/** Cycles through project titles to simulate a "now coding" sidebar widget. */
export function useNowCoding(): string {
  const titles = projects.map((p) => p.title);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % titles.length), NOW_CODING_INTERVAL);
    return () => clearInterval(t);
  }, [titles.length]);

  return titles[index];
}

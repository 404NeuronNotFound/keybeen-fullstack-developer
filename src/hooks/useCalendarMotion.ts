import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ContributionDay } from './useGithubContributions';
import { isPageTransitioning } from '../utils/pageTransition';

gsap.registerPlugin(useGSAP);

export function useCalendarMotion(days: ContributionDay[], loading: boolean) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller || loading || days.length === 0 || isPageTransitioning()) return;
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', context => {
      // No initial hiding: network, cached, error, and off-screen states all
      // stay readable. Only start the small wave when the card is in view.
      if (typeof IntersectionObserver === 'undefined') return;
      let played = false;
      const observer = new IntersectionObserver(entries => {
        if (played || context.isReverted || !entries.some(entry => entry.isIntersecting)) return;
        played = true;
        observer.disconnect();
        context.add(() => {
          const weeks = element.querySelectorAll('[data-contribution-week]');
          const stats = element.querySelectorAll('[data-contribution-stat]');
          const timeline = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'transform,opacity' } });
          if (weeks.length) timeline.fromTo(weeks,
            { scaleY: 0.72, opacity: 0.6, transformOrigin: 'center bottom' },
            { scaleY: 1, opacity: 1, duration: 0.4, stagger: { amount: 0.6 } }, 0,
          );
          if (stats.length) timeline.fromTo(stats,
            { y: 8, opacity: 0.7 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.06 }, 0.25,
          );
        });
      }, { root: scroller, threshold: 0.12 });
      observer.observe(element);
      return () => observer.disconnect();
    }, root);

    return () => media.revert();
  }, { scope: root, dependencies: [days, loading], revertOnUpdate: true });

  return root;
}

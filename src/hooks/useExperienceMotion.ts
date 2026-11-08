import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavStore } from '../store/navStore';
import { createScrollReveals } from '../utils/scrollReveals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useExperienceMotion(openId: number | null) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (useNavStore.getState().getScrollPosition('experience') < 40) {
        gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' } })
          .from('.experience-heading-copy > *', { y: 18, opacity: 0, stagger: 0.07 }, 0)
          .from('.experience-origin', { y: 12, opacity: 0 }, 0.16);
      }
      const stopReveals = createScrollReveals({
        scope: element, scroller, selector: '[data-experience-reveal]', context,
        distance: 16, duration: 0.55, delay: () => 0,
      });
      gsap.fromTo('.experience-rail > span', { scaleY: 0 }, {
        scaleY: 1, transformOrigin: 'top', ease: 'none',
        scrollTrigger: { trigger: '.experience-tree', scroller, start: 'top 72%', end: 'bottom 65%', scrub: 0.4 },
      });
      return stopReveals;
    }, root);

    // Wait until expansion settles instead of forcing layout on every frame.
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(refreshTimer);
      media.revert();
    };
  }, { scope: root });

  useGSAP(() => {
    if (openId === null) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.experience-node[data-expanded="true"] .experience-node-detail-inner > *',
        { y: 6, opacity: 0.65 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' },
      );
    }, root);
    return () => media.revert();
  }, { scope: root, dependencies: [openId], revertOnUpdate: true });

  return root;
}

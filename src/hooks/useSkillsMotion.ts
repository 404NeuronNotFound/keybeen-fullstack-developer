import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavStore } from '../store/navStore';
import { createScrollReveals } from '../utils/scrollReveals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useSkillsMotion(category: string, query: string) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (useNavStore.getState().getScrollPosition('skills') < 40) {
        gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' } })
          .from('.skills-intro-copy > *', { y: 18, opacity: 0, stagger: 0.07 }, 0)
          .from('.skills-discipline-index > div', { x: 12, opacity: 0, stagger: 0.08 }, 0.15);
      }
      const stopReveals = createScrollReveals({
        scope: element, scroller, selector: '[data-skills-reveal]', context,
        distance: 18, duration: 0.6,
        delay: target => Math.min(Number(target.dataset.skillsOrder ?? 0), 4) * 0.06,
      });
      return stopReveals;
    }, root);

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      media.revert();
    };
  }, { scope: root });

  // Filter feedback is independent of the entrance: typing never replays it.
  useGSAP(() => {
    const element = root.current;
    const results = element?.querySelector<HTMLElement>('.skills-results');
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!results || !scroller) return;
    const bounds = results.getBoundingClientRect();
    const viewport = scroller.getBoundingClientRect();
    if (bounds.top >= viewport.bottom || bounds.bottom <= viewport.top) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(results, { y: 6, opacity: 0.65 }, { y: 0, opacity: 1, duration: 0.24, ease: 'power2.out', clearProps: 'transform,opacity' });
    }, root);
    return () => media.revert();
  }, { scope: root, dependencies: [category, query], revertOnUpdate: true });

  return root;
}

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavStore } from '../store/navStore';
import { createScrollReveals } from '../utils/scrollReveals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useProjectsMotion(projectIds: string) {
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (useNavStore.getState().getScrollPosition('projects') >= 40) return;
      const entrance = gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' } })
        .from('.projects-eyebrow', { y: 6, opacity: 0 }, 0)
        .from('.projects-eyebrow > svg', { rotation: -90, duration: 0.9 }, 0)
        .fromTo('.projects-title-word', { yPercent: 110 }, { yPercent: 0, duration: 0.85, stagger: 0.09, ease: 'power4.out' }, 0.08)
        .from('.projects-heading-copy > p:last-child', { y: 10, opacity: 0 }, 0.26)
        .from('.projects-catalogue', { y: 12, opacity: 0.4 }, 0.22)
        .from('.projects-toolbar', { y: 8, opacity: 0.55, duration: 0.5 }, 0.34)
        .from('.projects-collection-heading', { y: 8, opacity: 0.55, duration: 0.5 }, 0.4)
        .from('.projects-album-item .project-card-art', { scale: 1.025, duration: 0.85, stagger: 0.025 }, 0.36)
        .fromTo('.projects-intro-rule', { scaleX: 0, opacity: 0.6 }, { scaleX: 1, opacity: 0.6, duration: 0.75, ease: 'power2.inOut', clearProps: 'transform' }, 0.02)
        .to('.projects-intro-rule', { opacity: 0, duration: 0.35 }, 0.64);
      intro.current = entrance;
      // A visitor can use the page immediately, even during its entrance.
      const finishOnFocus = (event: FocusEvent) => {
        if (event.target instanceof Element && event.target.closest('button, a, input, select')) entrance.progress(1);
      };
      element.addEventListener('focusin', finishOnFocus);
      return () => {
        element.removeEventListener('focusin', finishOnFocus);
        if (intro.current === entrance) intro.current = null;
      };
    }, root);
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
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', context => createScrollReveals({
      scope: element, scroller, selector: '[data-project-reveal]', context,
      distance: 18, duration: 0.65,
      delay: target => Math.max(0, 0.42 - (intro.current?.time() ?? 0.42)) + Math.min(Number(target.dataset.projectOrder ?? 0), 4) * 0.065,
    }), root);
    return () => media.revert();
  }, { scope: root, dependencies: [projectIds], revertOnUpdate: true });

  return root;
}

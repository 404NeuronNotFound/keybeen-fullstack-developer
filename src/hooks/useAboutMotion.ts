import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavStore } from '../store/navStore';
import { createScrollReveals } from '../utils/scrollReveals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useAboutMotion() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller) return;
    const media = gsap.matchMedia();

    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1000px)' }, context => {
      if (!context.conditions?.motion) return;
      // Read the destination's saved position, before App restores main's scroll.
      let entrance: gsap.core.Timeline | undefined;
      if (useNavStore.getState().getScrollPosition('about') < 40) {
        entrance = gsap.timeline({ defaults: { duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity' } })
          .from('.about-title-line', { y: 28, opacity: 0, stagger: 0.09 }, 0)
          .from('.about-photo', { y: 18, opacity: 0 }, 0.1)
          .from('[data-about-intro]', { y: 16, opacity: 0, stagger: 0.08 }, 0.18);
      }

      const stopReveals = createScrollReveals({
        scope: element, scroller, selector: '[data-about-reveal]', context,
        distance: context.conditions?.desktop ? 22 : 12, duration: 0.6,
        delay: target => Number(target.dataset.aboutOrder ?? 0) * 0.07,
      });

      gsap.fromTo('.about-workflow-rail > span', { scaleY: 0 }, {
        scaleY: 1, transformOrigin: 'top', ease: 'none',
        scrollTrigger: { trigger: '.about-workflow-list', scroller, start: 'top 75%', end: 'bottom 65%', scrub: 0.4 },
      });

      // Keyboard focus completes a reveal, so controls are always visible.
      const finishOnFocus = (event: FocusEvent) => {
        const focused = event.target;
        if (!(focused instanceof Node)) return;
        // Page-heading focus announces navigation; only controls skip the intro.
        if (focused instanceof Element && focused.closest('button, a') && element.querySelector('.about-profile')?.contains(focused)) entrance?.progress(1);
      };
      scroller.addEventListener('focusin', finishOnFocus);
      return () => {
        scroller.removeEventListener('focusin', finishOnFocus);
        stopReveals();
      };
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

  return root;
}

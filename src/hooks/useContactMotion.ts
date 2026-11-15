import { isPageTransitioning } from '../utils/pageTransition';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useNavStore } from '../store/navStore';
import { createScrollReveals } from '../utils/scrollReveals';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useContactMotion() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const element = root.current;
    const scroller = element?.closest<HTMLElement>('.app-content');
    if (!element || !scroller) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', context => {
      let intro: gsap.core.Timeline | undefined;
      if (!isPageTransitioning() && useNavStore.getState().getScrollPosition('contact') < 40) {
        intro = gsap.timeline({ defaults: { duration: 0.65, ease: 'power3.out', clearProps: 'transform,opacity' } })
          .from('.contact-heading > *', { y: 16, opacity: 0, stagger: 0.07 }, 0)
          .fromTo('.contact-compose', { y: 12, opacity: 0.85 }, { y: 0, opacity: 1 }, 0.12)
          .from('.contact-direct-intro, .contact-email-block, .contact-location', { y: 12, opacity: 0, stagger: 0.06 }, 0.18);
      }
      const stopReveals = createScrollReveals({
        scope: element, scroller, selector: '[data-contact-reveal]', context,
        distance: 12, duration: 0.5, delay: () => 0,
      });
      const onFocus = (event: FocusEvent) => {
        if (event.target instanceof Element && event.target.closest('input, textarea, button, a')) intro?.progress(1);
      };
      element.addEventListener('focusin', onFocus);
      return () => {
        element.removeEventListener('focusin', onFocus);
        stopReveals();
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

  return root;
}

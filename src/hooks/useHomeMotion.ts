import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The app scrolls inside main, rather than the browser window. */
export function useHomeMotion() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const scroller = root.current?.closest<HTMLElement>('.app-content');
    if (!scroller) return;
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      let intro: gsap.core.Timeline | undefined;
      // Preserve the visitor's place when returning via browser history.
      if (scroller.scrollTop < 40) {
        intro = gsap.timeline({ defaults: { duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity,visibility' } })
          .from('.hero-portrait', { opacity: 0, scale: 0.94 }, 0)
          .from('.hero-copy > *', { opacity: 0, y: 20, stagger: 0.07 }, 0.08)
          .from('.hero-stats > div', { opacity: 0, y: 12, stagger: 0.06 }, 0.3)
          .from('.hero-actions', { opacity: 0, y: 12 }, 0.42);
      }

      const reveals = gsap.utils.toArray<HTMLElement>('[data-home-reveal]', root.current).map(element => {
        // Animate wrappers so Framer Motion retains ownership of card hover transforms.
        const animation = gsap.from(element, {
          y: 24, opacity: 0, duration: 0.65, ease: 'power2.out',
          delay: Math.min(Number(element.dataset.revealOrder ?? 0), 3) * 0.08,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: element, scroller, start: 'clamp(top 94%)', once: true },
        });
        return { element, animation };
      });
      // Keyboard navigation must never land on a transparent control.
      const onFocus = (event: FocusEvent) => {
        if (event.target instanceof Element && event.target.closest('.home-hero')) intro?.progress(1);
        reveals.forEach(({ element, animation }) => {
          if (event.target instanceof Node && element.contains(event.target)) animation.progress(1);
        });
      };
      scroller.addEventListener('focusin', onFocus);
      return () => scroller.removeEventListener('focusin', onFocus);
    }, root);

    // Contribution data and responsive images can change the page height later.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      media.revert();
    };
  }, { scope: root });

  return root;
}

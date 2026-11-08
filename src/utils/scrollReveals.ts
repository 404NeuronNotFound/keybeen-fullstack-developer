import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface RevealOptions {
  scope: HTMLElement;
  scroller: HTMLElement;
  selector: string;
  context: gsap.Context;
  distance: number;
  duration: number;
  delay: (element: HTMLElement) => number;
}

/** Content stays visible until a trigger actually starts its entrance. */
export function createScrollReveals(options: RevealOptions) {
  const { scope, scroller, selector, context, distance, duration, delay } = options;
  const animations = new Map<HTMLElement, gsap.core.Tween>();
  const completed = new Set<HTMLElement>();
  const triggers = gsap.utils.toArray<HTMLElement>(selector, scope).map(element => {
    const reveal = () => {
      if (completed.has(element) || animations.has(element)) return;
      // onEnter runs after setup; register its tween with the media context so
      // route changes and reduced-motion changes also revert this animation.
      context.add(() => {
        animations.set(element, gsap.fromTo(element,
          { y: distance, opacity: 0 },
          {
            y: 0, opacity: 1, duration, delay: delay(element), ease: 'power2.out',
            clearProps: 'transform,opacity,visibility',
            onComplete: () => { completed.add(element); },
          },
        ));
      });
    };
    return ScrollTrigger.create({
      trigger: element, scroller, start: 'clamp(top 94%)', once: true,
      onEnter: reveal,
      // A restored position can jump past an entire section on the first frame.
      onLeave: reveal,
    });
  });

  const finishOnFocus = (event: FocusEvent) => {
    const focused = event.target;
    if (!(focused instanceof Node)) return;
    gsap.utils.toArray<HTMLElement>(selector, scope).forEach(element => {
      if (!element.contains(focused)) return;
      completed.add(element);
      animations.get(element)?.progress(1);
    });
  };
  scroller.addEventListener('focusin', finishOnFocus);

  return () => {
    scroller.removeEventListener('focusin', finishOnFocus);
    triggers.forEach(trigger => trigger.kill());
    animations.forEach(animation => animation.revert());
  };
}

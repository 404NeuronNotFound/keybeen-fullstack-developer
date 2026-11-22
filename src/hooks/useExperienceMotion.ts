import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { isPageTransitioning } from '../utils/pageTransition';
import { useNavStore } from '../store/navStore';

gsap.registerPlugin(useGSAP);

export function useExperienceMotion(chapterId: number) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (isPageTransitioning() || useNavStore.getState().getScrollPosition('experience') > 40) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } })
        .from('.experience-heading-copy > *, .experience-edition', { y: 14, opacity: 0, duration: 0.65, stagger: 0.06 }, 0)
        .from('.career-stop', { y: 12, opacity: 0, duration: 0.6, stagger: 0.09 }, 0.2)
        .from('.career-player', { y: 18, opacity: 0, duration: 0.75 }, 0.3);
    }, root);
    return () => media.revert();
  }, { scope: root });

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.career-chapter-copy > *', { y: 9, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.42, stagger: 0.035, ease: 'power2.out', clearProps: 'transform,opacity',
      });
    }, root);
    return () => media.revert();
  }, { scope: root, dependencies: [chapterId], revertOnUpdate: true });
  return root;
}

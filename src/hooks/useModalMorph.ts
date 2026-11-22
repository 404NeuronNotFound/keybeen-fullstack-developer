import { useEffect } from 'react';
import type { RefObject } from 'react';
import { gsap } from 'gsap';

/** Animate native dialogs without replacing their focus or Escape behavior. */
export function useModalMorph(ref: RefObject<HTMLDialogElement | null>, isOpen: boolean) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!isOpen) { if (dialog.open) dialog.close(); return; }
    if (dialog.open) return;

    // Capture the origin before showModal moves focus into the dialog.
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const card = trigger?.closest<HTMLElement>('.project-card-shell, .top-skill-card, .skill-orbit-card');
    const origin = card ?? (trigger?.matches('button, a') ? trigger : null);
    const from = origin?.getBoundingClientRect();
    const sourceCover = trigger?.closest('.project-card-shell, .project-bar-summary')?.querySelector<HTMLElement>('.project-cover');
    const coverFrom = sourceCover?.getBoundingClientRect();
    // Snapshot before showModal moves focus and the source sleeve starts closing.
    const sourceSnapshot = sourceCover?.cloneNode(true) as HTMLElement | undefined;
    const sourceSpin = sourceCover?.querySelector<HTMLElement>('.project-vinyl-spin');
    const copiedSpin = sourceSnapshot?.querySelector<HTMLElement>('.project-vinyl-spin');
    if (sourceSpin && copiedSpin) {
      copiedSpin.style.animation = 'none';
      copiedSpin.style.transform = getComputedStyle(sourceSpin).transform;
    }
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    dialog.dataset.morphState = 'opening';
    if (!preference.matches) dialog.dataset.modalMotion = 'morph';
    dialog.showModal();

    let context: gsap.Context | undefined;
    let coverCopy: HTMLElement | undefined;
    const complete = () => {
      if (dialog.dataset.morphState !== 'opening') return;
      dialog.dataset.morphState = 'ready';
      dialog.dispatchEvent(new Event('modal:morph-complete'));
    };
    const settle = () => {
      context?.revert();
      coverCopy?.remove();
      coverCopy = undefined;
      complete();
    };

    if (!preference.matches) {
      context = gsap.context(() => {
        const surface = dialog.querySelector<HTMLElement>('.modal-morph-surface');
        if (!surface) { complete(); return; }
        const to = surface.getBoundingClientRect();
        const maxX = window.innerWidth * 0.25;
        const maxY = window.innerHeight * 0.25;
        const offsetX = from ? Math.max(-maxX, Math.min(maxX, from.left + from.width / 2 - to.left - to.width / 2)) : 0;
        const offsetY = from ? Math.max(-maxY, Math.min(maxY, from.top + from.height / 2 - to.top - to.height / 2)) : 18;
        const destination = dialog.querySelector<HTMLElement>('.project-overview-cover .project-cover');
        const finalCover = destination?.getBoundingClientRect();
        const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: complete });
        timeline.fromTo(surface,
          { x: offsetX, y: offsetY, scaleX: from ? Math.max(0.72, Math.min(0.96, from.width / to.width)) : 0.96, scaleY: card && from ? Math.max(0.78, Math.min(0.96, from.height / to.height)) : 0.94, opacity: 0.35, borderRadius: 24 },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: 16, duration: 0.72, clearProps: 'transform,opacity,borderRadius' }, 0,
        );

        if (sourceSnapshot && coverFrom && coverFrom.width > 0 && destination && finalCover && finalCover.top >= to.top && finalCover.bottom <= to.bottom) {
          coverCopy = sourceSnapshot;
          coverCopy.setAttribute('aria-hidden', 'true');
          coverCopy.inert = true;
          Object.assign(coverCopy.style, { position: 'fixed', inset: 'auto', left: `${coverFrom.left}px`, top: `${coverFrom.top}px`, width: `${coverFrom.width}px`, height: `${coverFrom.height}px`, margin: '0', zIndex: '2', pointerEvents: 'none', transformOrigin: '0 0' });
          dialog.appendChild(coverCopy);
          gsap.set(destination, { opacity: 0 });
          // Land in the same closed-sleeve state as the destination before handing off.
          const vinylParts = coverCopy.querySelectorAll('.project-cover-print, .project-vinyl-disc');
          if (coverCopy.classList.contains('project-cover-vinyl') && destination.classList.contains('project-cover-vinyl')) {
            timeline.to(vinylParts, { xPercent: 0, duration: 0.72 }, 0);
          }
          timeline.to(coverCopy, { x: finalCover.left - coverFrom.left, y: finalCover.top - coverFrom.top, scaleX: finalCover.width / coverFrom.width, scaleY: finalCover.height / coverFrom.height, duration: 0.72 }, 0)
            .to(destination, { opacity: 1, duration: 0.12, clearProps: 'opacity' }, 0.72)
            .to(coverCopy, { opacity: 0, duration: 0.12, onComplete: () => coverCopy?.remove() }, 0.72);
        }
      }, dialog);
    } else complete();

    const onPreference = () => { if (preference.matches) settle(); };
    preference.addEventListener('change', onPreference);
    // Fast clicks, Tab, or Escape finish the transition before acting.
    dialog.addEventListener('pointerdown', settle);
    dialog.addEventListener('keydown', settle);
    dialog.addEventListener('scroll', settle, true);
    window.addEventListener('resize', settle);
    return () => {
      preference.removeEventListener('change', onPreference);
      dialog.removeEventListener('pointerdown', settle);
      dialog.removeEventListener('keydown', settle);
      dialog.removeEventListener('scroll', settle, true);
      window.removeEventListener('resize', settle);
      settle();
      if (dialog.open) dialog.close();
      delete dialog.dataset.modalMotion;
      delete dialog.dataset.morphState;
    };
  }, [ref, isOpen]);
}

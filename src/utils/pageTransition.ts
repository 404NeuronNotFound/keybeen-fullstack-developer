import { flushSync } from 'react-dom';
import { gsap } from 'gsap';

interface PageTransition {
  update: (() => void) | null;
  view?: ViewTransition;
  tween?: gsap.core.Tween;
  timeout?: ReturnType<typeof setTimeout>;
  preference?: MediaQueryList;
  onPreference?: () => void;
}

let current: PageTransition | null = null;

export function isPageTransitioning() {
  return typeof document !== 'undefined' && document.documentElement.dataset.pageTransition === 'active';
}

function commit(transition: PageTransition) {
  const update = transition.update;
  transition.update = null;
  if (update) flushSync(update);
}

function complete(transition: PageTransition) {
  clearTimeout(transition.timeout);
  if (transition.onPreference) transition.preference?.removeEventListener('change', transition.onPreference);
  if (current !== transition) return;
  current = null;
  delete document.documentElement.dataset.pageTransition;
}

/** Flush the previous selection before computing another history entry. */
export function settlePageTransition() {
  const transition = current;
  if (!transition) return;
  transition.view?.skipTransition();
  commit(transition);
  transition.tween?.progress(1);
  complete(transition);
}

export function transitionPage(update: () => void) {
  settlePageTransition();
  if (typeof document === 'undefined' || typeof window === 'undefined') { update(); return; }
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || document.visibilityState === 'hidden' || !document.querySelector('#main-content') || document.querySelector('.portfolio-entry, dialog[open]')) {
    update();
    return;
  }

  const transition: PageTransition = { update, preference };
  current = transition;
  document.documentElement.dataset.pageTransition = 'active';
  transition.onPreference = () => { if (preference.matches) settlePageTransition(); };
  preference.addEventListener('change', transition.onPreference);
  // A backgrounded tab or interrupted capture must never hold navigation open.
  transition.timeout = setTimeout(() => {
    if (current === transition) settlePageTransition();
  }, 1000);

  if (typeof document.startViewTransition === 'function') {
    try {
      transition.view = document.startViewTransition(() => commit(transition));
      void transition.view.ready.catch(() => {});
      void transition.view.finished.catch(() => {}).then(() => complete(transition));
      return;
    } catch { /* Use the GSAP entrance when browser snapshots are unavailable. */ }
  }

  commit(transition);
  const surface = document.querySelector<HTMLElement>('.page-transition-surface');
  if (!surface) { complete(transition); return; }
  transition.tween = gsap.fromTo(surface,
    { y: 10, scale: 0.99, opacity: 0.65, borderRadius: 16 },
    { y: 0, scale: 1, opacity: 1, borderRadius: 0, duration: 0.48, ease: 'power3.out', clearProps: 'transform,opacity,borderRadius', onComplete: () => complete(transition) },
  );
}

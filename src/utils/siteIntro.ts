const INTRO_KEY = 'keybeen:intro-seen:v1';

export function shouldPlaySiteIntro(): boolean {
  if (typeof window === 'undefined') return false;
  const route = window.location.hash.replace(/^#\/?/, '');
  if (route && route !== 'home') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (new URLSearchParams(window.location.search).get('intro') === '1') return true;
  try { return sessionStorage.getItem(INTRO_KEY) !== 'seen'; }
  catch { return true; }
}

export function rememberSiteIntro() {
  try { sessionStorage.setItem(INTRO_KEY, 'seen'); }
  catch { /* The entrance still completes when storage is unavailable. */ }
}

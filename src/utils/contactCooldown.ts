export const CONTACT_COOLDOWN_SECONDS = 600;
const STORAGE_KEY = 'keybeen-contact-cooldown-until';
const RETRY_KEY = 'keybeen-contact-email-retry-used';

function readDeadline(): number {
  try {
    const stored = Number(window.sessionStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0
      ? Math.min(stored, Date.now() + CONTACT_COOLDOWN_SECONDS * 1000) : 0;
  } catch {
    return 0;
  }
}

let deadline = readDeadline();
let emailRetryUsed = false;
try {
  emailRetryUsed = window.sessionStorage.getItem(RETRY_KEY) === 'true';
} catch { /* Keep retry state in memory when session storage is unavailable. */ }

export function getContactCooldownSeconds(): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

/** Reserve before sending, so errors and rapid repeat attempts cannot bypass it. */
export function beginContactCooldown(): boolean {
  if (getContactCooldownSeconds() > 0) return false;
  if (deadline > 0) {
    emailRetryUsed = false;
    try { window.sessionStorage.removeItem(RETRY_KEY); } catch { /* Use memory. */ }
  }
  deadline = Date.now() + CONTACT_COOLDOWN_SECONDS * 1000;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(deadline));
  } catch { /* Keep the cooldown in memory when session storage is unavailable. */ }
  return true;
}

/** Release the first invalid-email attempt so the visitor can correct it once. */
export function allowContactEmailRetry(): boolean {
  if (emailRetryUsed) return false;
  emailRetryUsed = true;
  deadline = 0;
  try {
    window.sessionStorage.setItem(RETRY_KEY, 'true');
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* Keep retry state and the cleared cooldown in memory. */ }
  return true;
}

export function formatContactCooldown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

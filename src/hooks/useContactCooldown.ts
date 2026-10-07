import { useCallback, useEffect, useState } from 'react';
import { getContactCooldownSeconds } from '../utils/contactCooldown';

export function useContactCooldown() {
  const [remaining, setRemaining] = useState(getContactCooldownSeconds);
  const refreshCooldown = useCallback(() => setRemaining(getContactCooldownSeconds()), []);
  useEffect(() => {
    const timer = window.setInterval(refreshCooldown, 1000);
    window.addEventListener('focus', refreshCooldown);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshCooldown);
    };
  }, [refreshCooldown]);
  return { remaining, refreshCooldown };
}

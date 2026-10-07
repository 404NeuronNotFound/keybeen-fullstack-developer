import { useCallback, useState } from 'react';
import { isEmailFormatValid } from '../utils/emailFormat';

export function useEmailValidation() {
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);
  const canUseEmail = isEmailFormatValid(email);
  const updateEmail = useCallback((value: string) => { setEmail(value); setShowError(false); }, []);
  const validate = useCallback(() => setShowError(true), []);
  const invalid = showError && email.trim().length > 0 && !canUseEmail;
  const check = {
    status: invalid ? 'invalid' as const : canUseEmail ? 'valid' as const : 'idle' as const,
    message: invalid ? 'Enter a full email address, such as you@example.com.' : '',
  };
  return { email, updateEmail, check, validate, canUseEmail };
}

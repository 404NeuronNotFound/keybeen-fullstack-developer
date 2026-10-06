import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '../store/toastStore';

type CheckStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'typo' | 'error';
interface EmailCheck {
  status: CheckStatus;
  message: string;
  suggestion?: string;
}

const INITIAL_CHECK: EmailCheck = { status: 'idle', message: '' };
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useEmailValidation() {
  const [email, setEmail] = useState('');
  const [check, setCheck] = useState<EmailCheck>(INITIAL_CHECK);
  const emailRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const completedRef = useRef('');
  const toastRef = useRef<number | null>(null);

  const validate = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const address = emailRef.current.trim();
    if (!address || controllerRef.current || completedRef.current === address) return;
    const generation = generationRef.current;

    const publish = (result: EmailCheck) => {
      setCheck(result);
      if (toastRef.current !== null) toast.dismiss(toastRef.current);
      toastRef.current = result.status === 'valid'
        ? toast.success({ title: 'Email looks good!', description: 'You can use this address for your message.' })
        : result.status === 'error'
          ? toast.info({ title: 'You can still send your message', description: result.message })
          : toast.error({ title: result.status === 'typo' ? 'A possible email typo' : 'Please check your email', description: result.message });
    };

    if (!emailFormat.test(address) || address.length > 254) {
      completedRef.current = address;
      publish({ status: 'invalid', message: 'Enter a full email address, such as you@example.com.' });
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setCheck({ status: 'checking', message: 'Checking your email…' });
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address }),
        signal: controller.signal,
      });
      const result: unknown = await response.json();
      if (generation !== generationRef.current) return;
      if (!response.ok || typeof result !== 'object' || result === null || !('status' in result) || !('email' in result) || result.email !== address) {
        throw new Error('Check unavailable');
      }

      let next: EmailCheck;
      if (result.status === 'valid') {
        next = { status: 'valid', message: 'Email verified. You’re ready to send.' };
      } else if (result.status === 'typo' && 'suggestion' in result && typeof result.suggestion === 'string' && emailFormat.test(result.suggestion)) {
        next = { status: 'typo', message: `Did you mean ${result.suggestion}? Choose the suggestion below or edit your address.`, suggestion: result.suggestion };
      } else if (result.status === 'invalid') {
        next = { status: 'invalid', message: 'This address could not receive email. Please check the spelling or use another address.' };
      } else {
        next = { status: 'error', message: 'Your email format looks right. We couldn’t confirm delivery, but you can still send or retry the check.' };
      }
      if (next.status !== 'error') completedRef.current = address;
      publish(next);
    } catch {
      if (generation !== generationRef.current) return;
      publish({ status: 'error', message: 'Your email format looks right. The extra check is unavailable, but you can still send your message.' });
    } finally {
      clearTimeout(timeout);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const updateEmail = useCallback((value: string) => {
    generationRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (toastRef.current !== null) toast.dismiss(toastRef.current);
    emailRef.current = value;
    completedRef.current = '';
    setEmail(value);
    setCheck(INITIAL_CHECK);
    if (value.trim()) timerRef.current = window.setTimeout(() => { void validate(); }, 10_000);
  }, [validate]);

  useEffect(() => () => {
    generationRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    if (toastRef.current !== null) toast.dismiss(toastRef.current);
  }, []);

  const canUseEmail = emailFormat.test(email.trim()) && email.trim().length <= 254 && (check.status === 'valid' || check.status === 'error');
  return { email, updateEmail, check, validate, canUseEmail };
}

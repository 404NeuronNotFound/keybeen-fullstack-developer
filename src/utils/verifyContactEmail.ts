export class ContactEmailValidationError extends Error {
  retryAvailable = false;
}

/** One request per send attempt; never runs while typing or on blur. */
export async function verifyContactEmail(email: string): Promise<void> {
  let response: Response;
  let result: unknown;
  try {
    response = await fetch('/api/validate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
      signal: AbortSignal.timeout(15_000),
    });
    result = await response.json();
  } catch {
    throw new Error('Email verification is unavailable. Retry when the countdown ends, or use the Gmail link.');
  }
  if (!response.ok || typeof result !== 'object' || result === null || !('email' in result) || result.email !== email.trim() || !('status' in result)) {
    throw new Error('Email verification could not be completed. Retry when the countdown ends, or use the Gmail link.');
  }
  if (result.status === 'invalid') throw new ContactEmailValidationError('This email address appears unable to receive mail. Please check it before your next attempt.');
  if (result.status === 'typo') {
    const suggestion = 'suggestion' in result && typeof result.suggestion === 'string' ? ` Did you mean ${result.suggestion}?` : '';
    throw new ContactEmailValidationError(`Please check the spelling of your email address.${suggestion}`);
  }
  if (result.status !== 'valid') throw new Error('We could not confirm this email address can receive mail. Please use another address or the Gmail link.');
}

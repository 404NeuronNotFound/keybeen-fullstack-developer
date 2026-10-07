import { isEmailFormatValid } from './emailFormat';
import { verifyContactEmail } from './verifyContactEmail';
import { beginContactCooldown, formatContactCooldown, getContactCooldownSeconds } from './contactCooldown';

interface ContactMessage {
  name: string;
  email: string;
  message: string;
  botcheck: boolean;
}

export async function submitContactMessage(accessKey: string, message: ContactMessage): Promise<void> {
  if (!accessKey.trim()) {
    throw new Error('Message sending is temporarily unavailable. Please use the email link above.');
  }
  if (!message.name.trim() || message.name.trim().length > 100 || !isEmailFormatValid(message.email)
    || !message.message.trim() || message.message.trim().length > 5000 || message.botcheck) {
    throw new Error('Please check your name, email address, and message.');
  }
  if (!beginContactCooldown()) {
    throw new Error(`Please wait ${formatContactCooldown(getContactCooldownSeconds())} before sending another message.`);
  }

  await verifyContactEmail(message.email);

  let response: Response;
  let result: unknown;

  try {
    response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey.trim(),
        subject: 'New message from Keybeen’s portfolio',
        from_name: 'Keybeen Portfolio',
        name: message.name.trim(),
        email: message.email.trim(),
        message: message.message.trim(),
        botcheck: message.botcheck,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    result = await response.json();
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new Error('The request timed out. Delivery could not be confirmed. Retry when the countdown ends, or use the email link above.', { cause: error });
    }
    throw new Error('Delivery could not be confirmed. Retry when the countdown ends, or use the email link above.', { cause: error });
  }

  if (response.status === 429) {
    throw new Error('Too many messages were sent recently. Please wait a little before trying again.');
  }

  if (!response.ok || typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
    throw new Error('Your message was not accepted. Retry when the countdown ends, or use the email link above.');
  }
}

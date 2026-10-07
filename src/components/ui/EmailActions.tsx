import { useRef, useState } from 'react';
import { Copy, Mail } from 'lucide-react';
import { SITE } from '../../constants';

export function EmailActions() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState('');
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setFeedback('Email copied.');
    } catch {
      inputRef.current?.focus();
      inputRef.current?.select();
      setFeedback('Email selected. Use your device’s copy command.');
    }
  }
  return <section className="contact-email-actions" aria-label="Email me">
    <label htmlFor="contact-direct-email">Email me directly</label>
    <div className="contact-email-row">
      <input ref={inputRef} id="contact-direct-email" value={SITE.email} readOnly onFocus={event => event.currentTarget.select()} />
      <button type="button" className="project-reader-button" onClick={() => { void copyEmail(); }}><Copy size={16} aria-hidden="true" />Copy email</button>
      <a className="project-reader-button" href={`mailto:${SITE.email}`}><Mail size={16} aria-hidden="true" />Open email</a>
    </div>
    <p role="status" aria-live="polite">{feedback}</p>
  </section>;
}

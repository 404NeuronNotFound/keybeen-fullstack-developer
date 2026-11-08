import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Copy, LoaderCircle, Mail, MapPin, MessageSquare } from 'lucide-react';
import { FaGithub, FaInstagram, FaTiktok } from 'react-icons/fa';
import { ContactLinkCard, type ContactLink } from '../components/ui';
import { FiMail } from 'react-icons/fi';
import { useContactCooldown } from '../hooks/useContactCooldown';
import { formatContactCooldown, getContactCooldownSeconds } from '../utils/contactCooldown';
import { useNavStore } from '../store';
import { useContactMotion } from '../hooks/useContactMotion';
import '../styles/contact.css';
import { SITE } from '../constants';
import { submitContactMessage } from '../utils/contactSubmission';
import { toast } from '../store/toastStore';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { ContactEmailValidationError } from '../utils/verifyContactEmail';

// contact links
const LINKS: ContactLink[] = [
  { icon: FiMail, label: 'Gmail', handle: SITE.email, color: 'var(--sp-green)', href: `mailto:${SITE.email}` },
  { icon: FaGithub,   label: 'GitHub',    handle: `@${SITE.githubUsername}`, color: 'var(--sp-white)', href: SITE.github },
  { icon: FaInstagram, label: 'Instagram', handle: `@${SITE.instagramUsername}`, color: 'var(--sp-instagram)', href: SITE.instagram },
  { icon: FaTiktok,   label: 'TikTok',    handle: `@${SITE.tiktokUsername}`, color: 'var(--sp-tiktok)', href: SITE.tiktok },
];

export function ContactPage() {
  const root = useContactMotion();
  const navigate = useNavStore(state => state.navigate);
  const { remaining, refreshCooldown } = useContactCooldown();
  const [name, setName] = useState('');
  const { email, updateEmail, check: emailCheck, validate: validateEmail, canUseEmail } = useEmailValidation();
  const [msg,  setMsg]  = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const [emailRetryWarning, setEmailRetryWarning] = useState('');
  const inFlight = useRef(false);
  const feedbackId = useRef<number | null>(null);
  const isSending = status === 'sending';
  const canSend = !isSending && remaining === 0 && canUseEmail && name.trim().length > 0 && msg.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || getContactCooldownSeconds() > 0) { refreshCooldown(); return; }

    const form = event.currentTarget;
    if (feedbackId.current !== null) toast.dismiss(feedbackId.current);
    if (!form.reportValidity()) return;
    if (!canUseEmail) {
      void validateEmail();
      return;
    }
    if (!name.trim() || !email.trim() || !msg.trim()) {
      feedbackId.current = toast.error({
        title: 'A little more detail, please',
        description: 'Enter your name, email, and a message. Blank spaces do not count.',
      });
      return;
    }

    const formData = new FormData(form);
    inFlight.current = true;
    setStatus('sending');

    try {
      const submission = submitContactMessage(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '', {
        name, email, message: msg, botcheck: formData.has('botcheck'),
      });
      refreshCooldown();
      await submission;
      feedbackId.current = toast.success({
        title: 'Message sent!',
        description: "Thanks for reaching out. I'll get back to you by email.",
      });
      setName('');
      updateEmail('');
      setMsg('');
      setEmailRetryWarning('');
      form.reset();
    } catch (submissionError) {
      setEmailRetryWarning(submissionError instanceof ContactEmailValidationError && submissionError.retryAvailable
        ? 'You have one more try. If your email fails validation again, you must wait 600 seconds (10 minutes).'
        : '');
      feedbackId.current = toast.error({
        title: "Couldn't send your message",
        description: `${submissionError instanceof Error ? submissionError.message : 'Please try again.'} Your message is still in the form.`,
      });
    } finally {
      refreshCooldown();
      inFlight.current = false;
      setStatus('idle');
    }
  }
 
  return (
    <div ref={root} className="page contact-page">
      <header className="contact-heading">
        <p className="contact-eyebrow"><MessageSquare size={14} aria-hidden="true" />Contact</p>
        <h1>Let's talk<span>.</span></h1>
        <p>Have a project in mind or a question about my work?<br className="contact-heading-break" /> Send a message or email me directly.</p>
      </header>

      <div className="contact-layout">
        <aside className="contact-direct" aria-labelledby="contact-direct-title">
          <div className="contact-direct-intro">
            <p className="contact-eyebrow">A conversation starts here</p>
            <h2 id="contact-direct-title">Tell me what{' '}<br />you're building.</h2>
            <p>An app idea, an everyday problem, or something in my portfolio you'd like to know more about.</p>
          </div>
          <div className="contact-email-block">
            <div className="contact-email-label"><Mail size={15} aria-hidden="true" /><span>Email me directly</span></div>
            <a className="contact-email-address" href={'mailto:' + SITE.email}>{SITE.email}<ArrowUpRight size={18} aria-hidden="true" /></a>
            <button type="button" className="contact-copy-email" onClick={async () => {
              try {
                await navigator.clipboard.writeText(SITE.email);
                toast.success({ title: 'Email address copied', description: 'Paste it into your email app to get in touch.' });
              } catch {
                toast.error({ title: "Couldn't copy the email address", description: 'Use the email link, or select and copy the address above.' });
              }
            }}><Copy size={13} aria-hidden="true" />Copy email address</button>
          </div>
          <p className="contact-location"><MapPin size={14} aria-hidden="true" />{SITE.location}</p>
          <section className="contact-elsewhere" aria-labelledby="contact-elsewhere-title" data-contact-reveal>
            <h3 id="contact-elsewhere-title">Elsewhere</h3>
            <div className="contact-social-list">{LINKS.slice(1).map(link => <ContactLinkCard key={link.label} link={link} />)}</div>
          </section>
        </aside>

        <section className="contact-compose" aria-labelledby="contact-form-title">
          <div className="contact-compose-heading"><div><p className="contact-eyebrow">In your own words</p><h2 id="contact-form-title">Send a message</h2></div><ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" /></div>
          <p className="contact-required-note">All fields are required.</p>
          <form onSubmit={handleSubmit} aria-busy={isSending}>
            <fieldset disabled={isSending || remaining > 0}>
              <div className="contact-field-pair">
                <div className="contact-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Your name" /></div>
                <div className="contact-field"><label htmlFor="contact-email">Your email</label><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => updateEmail(event.target.value)} onBlur={() => { void validateEmail(); }} placeholder="you@example.com" aria-describedby="contact-email-status" aria-invalid={emailCheck.status === 'invalid'} data-validation={emailCheck.status} />
                  <div id="contact-email-status" className="contact-email-status" role="status" aria-live="polite">{emailCheck.message}</div>
                </div>
              </div>
              <div className="contact-field contact-message-field"><label htmlFor="contact-message">What's on your mind?</label><textarea id="contact-message" name="message" required maxLength={5000} value={msg} onChange={event => setMsg(event.target.value)} placeholder="Tell me about the idea, the problem, or what you'd like to know." rows={6} aria-describedby="contact-message-help" />
                <div className="contact-message-meta"><p id="contact-message-help">Your name and email help me reply.</p><span>{msg.length.toLocaleString()} / 5,000<span className="sr-only"> characters</span></span></div>
              </div>
              <input type="checkbox" name="botcheck" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />
              <button type="submit" disabled={!canSend} aria-describedby={remaining > 0 ? 'contact-cooldown' : 'contact-email-status'} className="ui-button ui-button--primary ui-button--rounded contact-submit" aria-busy={isSending}>
                <span>{isSending ? 'Checking email and sending...' : remaining > 0 ? 'Please wait' : 'Send message'}</span>{isSending ? <LoaderCircle size={17} className="contact-send-spinner" aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
              </button>
            </fieldset>
            {remaining > 0 && <p id="contact-cooldown" className="contact-cooldown">You can send another message in <span role="timer" aria-live="off">{formatContactCooldown(remaining)}</span>.</p>}
            {emailRetryWarning && remaining === 0 && <p role="alert" className="contact-retry-warning">{emailRetryWarning}</p>}
            <div role="status" aria-live="polite" aria-atomic="true" className="contact-send-status">{isSending && 'Checking your email before sending your message...'}</div>
          </form>
        </section>
      </div>
      <footer className="contact-signoff" data-contact-reveal><p>Want to see the work first?</p><button type="button" onClick={() => navigate('projects')}>Explore projects<ArrowRight size={15} aria-hidden="true" /></button></footer>
    </div>
  );
}

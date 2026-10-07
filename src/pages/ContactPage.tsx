import { useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { FiMail } from 'react-icons/fi';
import { FaGithub, FaInstagram, FaTiktok } from 'react-icons/fa';
import { ContactLinkCard, type ContactLink } from '../components/ui';
import { SITE } from '../constants';
import { submitContactMessage } from '../utils/contactSubmission';
import { toast } from '../store/toastStore';
import { useEmailValidation } from '../hooks/useEmailValidation';

const FIELD_STYLE: CSSProperties = {
  width: '100%', background: 'var(--sp-dark2)', border: '1px solid var(--sp-gray2)',
  borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--sp-white)',
  fontSize: 14, boxSizing: 'border-box',
};

const LABEL_STYLE: CSSProperties = {
  display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--sp-white)',
};

// contact links
const LINKS: ContactLink[] = [
  { icon: FiMail,     label: 'Gmail',     handle: SITE.email,        color: 'var(--sp-green)', href: `mailto:${SITE.email}` },
  { icon: FaGithub,   label: 'GitHub',    handle: `@${SITE.githubUsername}`, color: 'var(--sp-white)', href: SITE.github },
  { icon: FaInstagram, label: 'Instagram', handle: `@${SITE.instagramUsername}`, color: 'var(--sp-instagram)', href: SITE.instagram },
  { icon: FaTiktok,   label: 'TikTok',    handle: `@${SITE.tiktokUsername}`, color: 'var(--sp-tiktok)', href: SITE.tiktok },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const { email, updateEmail, check: emailCheck, validate: validateEmail, canUseEmail } = useEmailValidation();
  const [msg,  setMsg]  = useState('');
  const [status, setStatus] = useState<'idle' | 'sending'>('idle');
  const inFlight = useRef(false);
  const feedbackId = useRef<number | null>(null);
  const isSending = status === 'sending';
  const canSend = !isSending && canUseEmail && name.trim().length > 0 && msg.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

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
      await submitContactMessage(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '', {
        name, email, message: msg, botcheck: formData.has('botcheck'),
      });
      feedbackId.current = toast.success({
        title: 'Message sent!',
        description: "Thanks for reaching out. I'll get back to you by email.",
      });
      setName('');
      updateEmail('');
      setMsg('');
      form.reset();
    } catch (submissionError) {
      feedbackId.current = toast.error({
        title: "Couldn't send your message",
        description: `${submissionError instanceof Error ? submissionError.message : 'Please try again.'} Your message is still in the form.`,
      });
    } finally {
      inFlight.current = false;
      setStatus('idle');
    }
  }
 
  return (
    <div className="page">
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 10 }}>
        Contact
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--sp-white)', letterSpacing: '-1px', marginBottom: 12 }}>
        Let's collab
      </h1>
      <p style={{ fontSize: 15, color: 'var(--sp-gray)', marginBottom: 32, maxWidth: 480 }}>
        Open to full-time roles, freelance projects, and interesting conversations. My DMs are always open.
      </p>
 
      {/* social links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 36 }}>
        {LINKS.map((link) => (
          <ContactLinkCard key={link.label} link={link} />
        ))}
      </div>
 
      {/* message form */}
      <div style={{ background: 'var(--sp-dark2)', borderRadius: 'var(--radius-md)', padding: 24, border: '1px solid var(--sp-dark3)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sp-white)', marginBottom: 16 }}>Send a message</div>
 
        <form onSubmit={handleSubmit} aria-busy={isSending}>
          <fieldset disabled={isSending} style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
            <label htmlFor="contact-name" style={LABEL_STYLE}>Your name</label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ ...FIELD_STYLE, marginBottom: 16 }}
            />
            <label htmlFor="contact-email" style={LABEL_STYLE}>Your email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => updateEmail(e.target.value)}
              onBlur={() => { void validateEmail(); }}
              placeholder="you@example.com"
              aria-describedby="contact-email-status"
              aria-invalid={emailCheck.status === 'invalid' || emailCheck.status === 'typo'}
              aria-busy={emailCheck.status === 'checking'}
              style={{ ...FIELD_STYLE, borderColor: emailCheck.status === 'valid' ? 'var(--sp-green)' : emailCheck.status === 'invalid' || emailCheck.status === 'typo' ? 'var(--sp-warning)' : 'var(--sp-gray2)' }}
            />
            <div id="contact-email-status" role="status" aria-live="polite" style={{ fontSize: 13, marginBottom: 16, color: emailCheck.status === 'valid' ? 'var(--sp-green)' : 'var(--sp-gray)', overflowWrap: 'anywhere' }}>
              {emailCheck.message}
            </div>
            {emailCheck.status === 'typo' && emailCheck.suggestion && (
              <button type="button" onClick={() => { updateEmail(emailCheck.suggestion!); void validateEmail(); }} style={{ padding: '10px 14px', marginBottom: 16, border: '1px solid var(--sp-green)', borderRadius: 20, background: 'transparent', color: 'var(--sp-white)', cursor: 'pointer', maxWidth: '100%', overflowWrap: 'anywhere' }}>
                Use {emailCheck.suggestion}
              </button>
            )}
            {emailCheck.status === 'error' && (
              <button type="button" onClick={() => { void validateEmail(); }} style={{ padding: '10px 14px', marginBottom: 16, border: '1px solid var(--sp-gray)', borderRadius: 20, background: 'transparent', color: 'var(--sp-white)', cursor: 'pointer' }}>
                Retry email check
              </button>
            )}
            <label htmlFor="contact-message" style={LABEL_STYLE}>Your message</label>
            <textarea
              id="contact-message"
              name="message"
              required
              maxLength={5000}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Hey, I'd love to work on something together..."
              rows={4}
              style={{ ...FIELD_STYLE, resize: 'vertical', marginBottom: 12 }}
            />
            <input type="checkbox" name="botcheck" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />
            <p style={{ fontSize: 12, color: 'var(--sp-gray)', marginBottom: 16 }}>
              Your details help me reply to your message.
            </p>
            <button
              type="submit"
              disabled={!canSend}
              aria-describedby="contact-email-status"
              style={{ padding: '10px 28px', background: 'var(--sp-green)', border: 'none', borderRadius: 24, color: 'var(--sp-on-green)', fontSize: 14, fontWeight: 700, cursor: isSending ? 'wait' : canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.5, transition: 'opacity .15s' }}
            >
              {isSending ? 'Sending…' : emailCheck.status === 'checking' ? 'Checking email…' : 'Send message'}
            </button>
          </fieldset>
          <div role="status" aria-live="polite" aria-atomic="true" style={{ marginTop: 16, color: 'var(--sp-green)', fontSize: 14 }}>
            {isSending && 'Sending your message…'}
          </div>
        </form>
      </div>
    </div>
  );
}

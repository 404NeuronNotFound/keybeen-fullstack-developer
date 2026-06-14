import { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { FaGithub, FaInstagram, FaTiktok } from 'react-icons/fa';
import { ContactLinkCard, type ContactLink } from '../components/ui';
import { SITE } from '../constants';

const LINKS: ContactLink[] = [
  { icon: FiMail,     label: 'Gmail',     handle: SITE.email,        color: '#1DB954', href: `mailto:${SITE.email}` },
  { icon: FaGithub,   label: 'GitHub',    handle: '@404NeuronNotFound', color: '#e0e0e0', href: SITE.github },
  { icon: FaInstagram, label: 'Instagram', handle: '@kxvxn',          color: '#E1306C', href: SITE.instagram },
  { icon: FaTiktok,   label: 'TikTok',    handle: '@keybeen.creatives', color: '#69C9D0', href: SITE.tiktok },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const [msg,  setMsg]  = useState('');
  const [sent, setSent] = useState(false);

  const canSend = name.trim().length > 0 && msg.trim().length > 0;

  return (
    <div style={{ padding: '40px 32px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
        {LINKS.map((link) => (
          <ContactLinkCard key={link.label} link={link} />
        ))}
      </div>

      {/* message form */}
      <div style={{ background: 'var(--sp-dark2)', borderRadius: 'var(--radius-md)', padding: 24, border: '1px solid var(--sp-dark3)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sp-white)', marginBottom: 16 }}>Send a message</div>

        {sent ? (
          <div style={{ padding: '16px 20px', background: 'rgba(29,185,84,.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--sp-green)', color: 'var(--sp-green)', fontWeight: 700, fontSize: 14 }}>
            ✓ Sent! I'll get back to you soon.
          </div>
        ) : (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', marginBottom: 10, background: '#252525', border: '1px solid #333', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--sp-white)', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--sp-green)'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#333'; }}
            />
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Hey, I'd love to work on something together..."
              rows={4}
              style={{ width: '100%', background: '#252525', border: '1px solid #333', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--sp-white)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 12, transition: 'border-color .15s' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--sp-green)'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#333'; }}
            />
            <button
              onClick={() => canSend && setSent(true)}
              disabled={!canSend}
              style={{ padding: '10px 28px', background: canSend ? 'var(--sp-green)' : '#333', border: 'none', borderRadius: 24, color: canSend ? '#000' : '#666', fontSize: 14, fontWeight: 700, cursor: canSend ? 'pointer' : 'default', transition: 'all .15s' }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = 'var(--sp-green-h)'; }}
              onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = 'var(--sp-green)'; }}
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}
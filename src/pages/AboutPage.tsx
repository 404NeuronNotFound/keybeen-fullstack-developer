import { ChevronRight, MessageCircle } from 'lucide-react';
import { useNavStore } from '../store';
import { SITE }        from '../constants';

const BIO_PARAGRAPHS = [
  `I'm a <b> AI Assisted Full-Stack App & Web Developer</b> who loves turning complex idea or problem into clean, elegant solutions. I've been shipping code for 3+ years, from scrappy <"Hello World!"> to scaling products used by me.`,
  `My stack spans both ends: <b>React & TypeScript</b> on the frontend, <b>Node.js, Django, & PostgreSQL</b> on the backend. I care deeply about performance, accessibility, and developer experience.`,
  `When I'm not coding, I'm editing videos for international clients, or doing side quests around ${SITE.location} outdoors. I believe great software is made by people who give a damn.`,
];

export function AboutPage() {
  const navigate = useNavStore((s) => s.navigate);
 
  return (
    <div className="page">
      <div style={{ background: 'rgba(29,185,84,.08)', border: '1px solid var(--sp-dark3)', borderRadius: 'var(--radius-md)', padding: 32, marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 10 }}>About me</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--sp-white)', letterSpacing: '-1px', marginBottom: 24 }}>Hey, I build things.</h1>
        {BIO_PARAGRAPHS.map((text, i) => (
          <p
            key={i}
            style={{ fontSize: 15, color: 'var(--sp-gray)', lineHeight: 1.8, maxWidth: 640, marginBottom: 16 }}
            dangerouslySetInnerHTML={{
              __html: text
                .replace(/<b>/g, '<strong style="color:var(--sp-white)">')
                .replace(/<\/b>/g, '</strong>'),
            }}
          />
        ))}
      </div>
 
      <button
        onClick={() => navigate('contact')}
        style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--sp-dark2)', border: '1px solid var(--sp-dark3)', borderLeft: '3px solid var(--sp-green)', borderRadius: 'var(--radius-md)', padding: '20px 24px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background .15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#242424'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sp-dark2)'; }}
      >
        <div style={{ width: 48, height: 48, background: 'rgba(29,185,84,.12)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageCircle size={22} color="var(--sp-green)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-white)', marginBottom: 2 }}>Open to opportunities</div>
          <div style={{ fontSize: 12, color: 'var(--sp-gray)' }}>Available for freelance &amp; full-time roles · Let's talk</div>
        </div>
        <ChevronRight size={18} color="var(--sp-gray)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </button>
    </div>
  );
}

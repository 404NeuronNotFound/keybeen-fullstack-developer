import { Hammer, ExternalLink } from 'lucide-react';
import { TeaserCard, Button } from '../components/ui';
import { useNavStore } from '../store';
import { projects } from '../data';
import { SITE } from '../constants';

export function ProjectsPage() {
  const navigate = useNavStore((s) => s.navigate);

  return (
    <div style={{ padding: '40px 32px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 10 }}>
        Projects
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--sp-white)', letterSpacing: '-1px', marginBottom: 24 }}>
        The discography
      </h1>

      {/* ── "in development" banner — Spotify empty-state style ───────── */}
      <div
        style={{
          background:   'linear-gradient(135deg, rgba(29,185,84,.12), var(--sp-dark2))',
          border:       '1px solid var(--sp-dark3)',
          borderRadius: 'var(--radius-md)',
          padding:      '40px 32px',
          display:      'flex',
          flexDirection: 'column',
          alignItems:   'center',
          textAlign:    'center',
          gap:          16,
          marginBottom: 36,
        }}
      >
        <div
          style={{
            width:          64,
            height:         64,
            borderRadius:   '50%',
            background:     'rgba(29,185,84,.12)',
            border:         '1px solid rgba(29,185,84,.3)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            animation:      'softPulse 2.4s ease-in-out infinite',
          }}
        >
          <Hammer size={26} color="var(--sp-green)" />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 8 }}>
            In development
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 8 }}>
            New tracks dropping soon
          </h2>
          <p style={{ fontSize: 14, color: 'var(--sp-gray)', maxWidth: 440, lineHeight: 1.6 }}>
            This page and the projects on it are still in the studio. I'm actively building
            things and will publish them here as they ship. Check back soon, or follow along on GitHub.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="primary"
            rounded
            onClick={() => window.open(SITE.github, '_blank', 'noopener,noreferrer')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ExternalLink size={16} />
            Follow on GitHub
          </Button>
          <Button variant="outline" rounded onClick={() => navigate('contact')}>
            Get notified
          </Button>
        </div>
      </div>

      {/* ── teaser grid — locked previews of what's coming ─────────────── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 16 }}>Up next</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16 }}>
        {projects.map((p) => (
          <TeaserCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
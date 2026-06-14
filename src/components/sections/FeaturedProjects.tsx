import { Clock } from 'lucide-react';
import { useNavStore }       from '../../store';
import { TeaserCard, TeaserRow, Tag } from '../../components/ui';
import { projects }          from '../../data';

export function FeaturedProjects() {
  const navigate = useNavStore((s) => s.navigate);

  return (
    <div style={{ padding: '0 32px 40px' }}>
      {/* ── featured teaser cards ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '28px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-white)' }}>Featured projects</h2>
          <Tag>Coming soon</Tag>
        </div>
        <button
          onClick={() => navigate('projects')}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sp-gray)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .1s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sp-white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sp-gray)'; }}
        >
          See all
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 16, marginBottom: 40 }}>
        {projects.filter((p) => p.featured).map((p) => (
          <TeaserCard key={p.id} project={p} />
        ))}
      </div>

      {/* ── full track list teaser ────────────────────────────────────── */}
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 16 }}>All tracks</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--sp-dark3)' }}>
            <th style={{ width: 40, padding: '8px 16px', color: 'var(--sp-gray)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>#</th>
            <th style={{ padding: '8px 0', color: 'var(--sp-gray)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '8px 16px', color: 'var(--sp-gray)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '8px 16px', color: 'var(--sp-gray)', fontSize: 11, textAlign: 'right' }}>
              <Clock size={13} style={{ verticalAlign: 'middle' }} />
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <TeaserRow key={p.id} project={p} index={i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
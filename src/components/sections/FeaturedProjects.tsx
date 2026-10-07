import { useNavStore } from '../../store';
import { TeaserCard } from '../../components/ui';
import { GithubActivitySection } from './GithubActivitySection';
import { projects }          from '../../data';

export function FeaturedProjects() {
  const navigate = useNavStore((s) => s.navigate);

  return (
    <div className="page-x" style={{ paddingBottom: 40 }}>
      {/* ── GitHub contribution activity ──────────────────────────────── */}
      <GithubActivitySection />

      {/* ── featured teaser cards ─────────────────────────────────────── */}
      <div className="featured-project-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sp-white)' }}>Featured projects</h2>
        </div>
        <button
          onClick={() => navigate('projects')}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sp-gray)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .1s', flexShrink: 0, minHeight: 44 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sp-white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sp-gray)'; }}
        >
          See all
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(175px, 100%), 1fr))', gridAutoRows: '1fr', gap: 16, marginBottom: 40 }}>
        {projects.filter((p) => p.featured).map((p) => (
          <TeaserCard key={p.id} project={p} />
        ))}
      </div>

    </div>
  );
}

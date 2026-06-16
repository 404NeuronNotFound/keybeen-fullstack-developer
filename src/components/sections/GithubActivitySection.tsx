import { FaGithub } from 'react-icons/fa';
import { ExternalLink, Flame, TrendingUp, Star } from 'lucide-react';
import { useGithubContributions } from '../../hooks';
import { ContributionHeatmap } from '../../components/ui';
import { computeContributionStats, formatShortDate } from '../../utils';
import { SITE } from '../../constants';

const LEGEND_LEVELS = [
  'var(--sp-dark3)',
  'rgba(29,185,84,0.25)',
  'rgba(29,185,84,0.5)',
  'rgba(29,185,84,0.75)',
  'var(--sp-green)',
];

interface StatPillProps {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
}

function StatPill({ icon, label, value, sub }: StatPillProps) {
  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        background:    'rgba(255,255,255,.04)',
        border:        '1px solid var(--sp-dark3)',
        borderRadius:  'var(--radius-md)',
        padding:       '12px 16px',
        flex:          '1 1 120px',
        minWidth:      0,
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(29,185,84,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--sp-gray)', fontWeight: 600, letterSpacing: '.3px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--sp-white)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--sp-gray)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function GithubActivitySection() {
  const { days, total, loading, error } = useGithubContributions(SITE.githubUsername);
  const stats = computeContributionStats(days);

  return (
    <div
      style={{
        background:   'var(--sp-dark2)',
        border:       '1px solid var(--sp-dark3)',
        borderRadius: 'var(--radius-md)',
        overflow:     'hidden',
        marginTop:    28,
        marginBottom: 32,
      }}
    >
      {/* ── header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '16px 20px 14px',
          borderBottom:   '1px solid var(--sp-dark3)',
          gap:            12,
          flexWrap:       'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaGithub size={16} color="var(--sp-white)" />
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--sp-white)' }}>
            Contribution activity
          </span>
          {!loading && !error && total > 0 && (
            <span
              style={{
                fontSize:    12,
                color:       'var(--sp-gray)',
                fontWeight:  400,
                paddingLeft: 4,
              }}
            >
              —&nbsp;
              <strong style={{ color: 'var(--sp-green)', fontWeight: 700 }}>
                {total.toLocaleString()}
              </strong>
              &nbsp;this year
            </span>
          )}
          {loading && (
            <span style={{ fontSize: 12, color: 'var(--sp-gray)' }}>Loading…</span>
          )}
        </div>

        <a
          href={SITE.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            5,
            fontSize:       12,
            fontWeight:     700,
            color:          'var(--sp-gray)',
            textDecoration: 'none',
            transition:     'color .15s',
            flexShrink:     0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sp-white)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sp-gray)'; }}
        >
          @{SITE.githubUsername}
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ── body ───────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 14px' }}>
        {error ? (
          <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 13, color: 'var(--sp-gray)' }}>
            Couldn't reach GitHub — check back later.
          </div>
        ) : (
          <>
            {/* heatmap */}
            <ContributionHeatmap days={days} loading={loading} />

            {/* legend */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'flex-end',
                alignItems:     'center',
                gap:             5,
                marginTop:       10,
                marginBottom:    20,
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--sp-gray)' }}>Less</span>
              {LEGEND_LEVELS.map((color, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              ))}
              <span style={{ fontSize: 10, color: 'var(--sp-gray)' }}>More</span>
            </div>

            {/* stats pills row */}
            {!loading && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatPill
                  icon={<TrendingUp size={15} color="var(--sp-green)" />}
                  label="Total"
                  value={total.toLocaleString()}
                  sub="contributions"
                />
                <StatPill
                  icon={<Flame size={15} color="var(--sp-green)" />}
                  label="Current streak"
                  value={`${stats.currentStreak}d`}
                  sub="days in a row"
                />
                <StatPill
                  icon={<TrendingUp size={15} color="var(--sp-green)" />}
                  label="Longest streak"
                  value={`${stats.longestStreak}d`}
                  sub="personal best"
                />
                {stats.bestDay && (
                  <StatPill
                    icon={<Star size={15} color="var(--sp-green)" />}
                    label="Best day"
                    value={String(stats.bestDay.count)}
                    sub={formatShortDate(stats.bestDay.date)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
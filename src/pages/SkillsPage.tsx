import { useMemo, useState } from 'react';
import { Code2, Server, Cloud } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EqualizerBars, TopSkillCard } from '../components/ui';
import { skills } from '../data';
import type { Skill } from '../types';

interface SkillWithCategory extends Skill {
  category: string;
}

/** One icon per category — keeps the "album art" feel consistent */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Frontend: Code2,
  Backend:  Server,
  DevOps:   Cloud,
};

/** Cycled across cards/rows for visual variety, Spotify-cover style */
const GRADIENTS = ['emerald', 'blue', 'purple', 'teal', 'yellow', 'zinc'];

function proficiencyLabel(level: number): string {
  if (level >= 90) return 'Expert';
  if (level >= 80) return 'Advanced';
  if (level >= 70) return 'Intermediate';
  return 'Familiar';
}

export function SkillsPage() {
  const categories = useMemo(() => Object.keys(skills), []);
  const [activeTab, setActiveTab] = useState<string>(categories[0]);
  const [hovered, setHovered] = useState<string | null>(null);

  const allSkills: SkillWithCategory[] = useMemo(
    () =>
      Object.entries(skills).flatMap(([category, list]) =>
        list.map((s) => ({ ...s, category }))
      ),
    []
  );

  const topSkills = useMemo(
    () => [...allSkills].sort((a, b) => b.level - a.level).slice(0, 5),
    [allSkills]
  );

  return (
    <div style={{ padding: '40px 32px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sp-green)', marginBottom: 10 }}>
        Tech stack
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--sp-white)', letterSpacing: '-1px', marginBottom: 32 }}>
        Tools of the trade
      </h1>

      {/* ── Top skills — Spotify "Top artists" style row ─────────────── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--sp-white)', marginBottom: 16 }}>Most played</h2>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, marginBottom: 36 }}>
        {topSkills.map((s, i) => (
          <TopSkillCard
            key={s.name}
            skill={s}
            icon={CATEGORY_ICONS[s.category] ?? Code2}
            gradient={GRADIENTS[i % GRADIENTS.length]}
            rank={i + 1}
          />
        ))}
      </div>

      {/* ── Category tabs — genre pill style ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{ padding: '8px 20px', borderRadius: 24, border: '1px solid', borderColor: activeTab === cat ? 'var(--sp-green)' : 'var(--sp-gray2)', background: activeTab === cat ? 'rgba(29,185,84,.12)' : 'transparent', color: activeTab === cat ? 'var(--sp-green)' : 'var(--sp-gray)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Track-list style rows ─────────────────────────────────────── */}
      <div style={{ maxWidth: 560, marginTop: 8 }}>
        {skills[activeTab].map((s, i) => {
          const Icon = CATEGORY_ICONS[activeTab] ?? Code2;
          const isHovered = hovered === s.name;
          return (
            <div
              key={s.name}
              onMouseEnter={() => setHovered(s.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: isHovered ? 'var(--sp-dark2)' : 'transparent', transition: 'background .1s' }}
            >
              <span style={{ width: 18, textAlign: 'center', color: 'var(--sp-gray)', fontSize: 13, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {i + 1}
              </span>

              <div
                className={`grad-${GRADIENTS[i % GRADIENTS.length]}`}
                style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <Icon size={18} color="#fff" strokeWidth={1.5} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sp-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--sp-gray)' }}>{proficiencyLabel(s.level)}</div>
              </div>

              <EqualizerBars level={s.level} active={isHovered} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
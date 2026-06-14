import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks';
import { Tag } from './Tag';
import type { Skill, Project } from '../../types';

interface Props {
  skill: Skill;
  relatedProjects: Project[];
  onProjectClick: (project: Project) => void;
}

function proficiencyLabel(level: number): string {
  if (level >= 90) return 'Expert';
  if (level >= 80) return 'Advanced';
  if (level >= 70) return 'Intermediate';
  return 'Familiar';
}

export function SkillRow({ skill, relatedProjects, onProjectClick }: Props) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.3 });
  const [open, setOpen] = useState(false);
  const hasProjects = relatedProjects.length > 0;

  return (
    <div ref={ref} style={{ borderBottom: '1px solid var(--sp-dark3)' }}>
      {/* header row — clickable when there are related projects */}
      <div
        role={hasProjects ? 'button' : undefined}
        tabIndex={hasProjects ? 0 : undefined}
        onClick={() => hasProjects && setOpen((o) => !o)}
        onKeyDown={(e) => { if (hasProjects && (e.key === 'Enter' || e.key === ' ')) setOpen((o) => !o); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 4px', cursor: hasProjects ? 'pointer' : 'default' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ color: 'var(--sp-white)', fontSize: 14, fontWeight: 600 }}>{skill.name}</span>
            <Tag variant="green">{proficiencyLabel(skill.level)}</Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ color: 'var(--sp-green)', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {skill.level}%
            </span>
            {hasProjects && (
              <ChevronDown
                size={16}
                style={{ color: 'var(--sp-gray)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            )}
          </div>
        </div>

        <div style={{ height: 4, background: '#2a2a2a', borderRadius: 99 }}>
          <div
            style={{
              width:      isVisible ? `${skill.level}%` : '0%',
              height:     '100%',
              background: 'linear-gradient(90deg, var(--sp-green), var(--sp-green-h))',
              borderRadius: 99,
              transition: 'width 1.1s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
      </div>

      {/* expandable related projects */}
      {hasProjects && open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 4px 16px', animation: 'fadeIn .2s ease' }}>
          <span style={{ fontSize: 12, color: 'var(--sp-gray)', width: '100%' }}>
            Used in {relatedProjects.length} project{relatedProjects.length > 1 ? 's' : ''}:
          </span>
          {relatedProjects.map((p) => (
            <button
              key={p.id}
              onClick={(e) => { e.stopPropagation(); onProjectClick(p); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--sp-dark2)', border: '1px solid var(--sp-dark3)', borderRadius: 20, cursor: 'pointer', color: 'var(--sp-white)', fontSize: 12, fontWeight: 600, transition: 'background .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sp-dark3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sp-dark2)'; }}
            >
              <span>{p.emoji}</span>
              {p.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
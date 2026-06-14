import type { LucideIcon } from 'lucide-react';
import type { Skill } from '../../types';

interface Props {
  skill:    Skill;
  icon:     LucideIcon;
  gradient: string;
  /** small rank badge, e.g. "#1" */
  rank?:    number;
}

export function TopSkillCard({ skill, icon: Icon, gradient, rank }: Props) {
  return (
    <div
      style={{ flex: '0 0 132px', cursor: 'default', transition: 'transform .15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div
        className={`grad-${gradient}`}
        style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative', overflow: 'hidden' }}
      >
        <Icon size={36} color="#fff" strokeWidth={1.5} />
        {rank && (
          <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.85)', letterSpacing: '.5px' }}>
            #{rank}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sp-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {skill.name}
      </div>
      <div style={{ fontSize: 12, color: 'var(--sp-gray)' }}>{skill.level}% proficiency</div>
    </div>
  );
}
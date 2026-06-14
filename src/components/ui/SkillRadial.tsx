import { useIntersectionObserver } from '../../hooks';
import type { Skill } from '../../types';

const SIZE   = 92;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC   = 2 * Math.PI * RADIUS;

export function SkillRadial({ name, level }: Skill) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.3 });
  const offset = CIRC * (1 - (isVisible ? level : 0) / 100);

  return (
    <div
      ref={ref}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'var(--sp-dark2)', border: '1px solid var(--sp-dark3)', borderRadius: 'var(--radius-md)', padding: '20px 12px', transition: 'background .15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sp-dark3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sp-dark2)'; }}
    >
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#2a2a2a" strokeWidth={STROKE} fill="none" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="var(--sp-green)"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--sp-white)' }}>
          {level}%
        </div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sp-white)', textAlign: 'center' }}>{name}</span>
    </div>
  );
}
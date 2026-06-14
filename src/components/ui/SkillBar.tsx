import { useIntersectionObserver } from '../../hooks';
import type { Skill } from '../../types';

export function SkillBar({ name, level }: Skill) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.4 });

  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: '#e0e0e0', fontSize: 13, fontWeight: 500 }}>{name}</span>
        <span style={{ color: 'var(--sp-green)', fontSize: 12, fontWeight: 700 }}>{level}%</span>
      </div>
      <div style={{ height: 3, background: '#2a2a2a', borderRadius: 99 }}>
        <div style={{ width: isVisible ? `${level}%` : '0%', height: '100%', background: 'linear-gradient(90deg, var(--sp-green), var(--sp-green-h))', borderRadius: 99, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
}

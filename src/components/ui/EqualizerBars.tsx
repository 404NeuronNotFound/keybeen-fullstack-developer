import { useIntersectionObserver } from '../../hooks';

interface Props {
  /** 0 – 100 */
  level: number;
  /** plays the bounce animation, like a "now playing" indicator */
  active?: boolean;
}

const MAX_HEIGHT = 22;
const BAR_RATIOS = [0.55, 1, 0.75, 0.9, 0.6];

export function EqualizerBars({ level, active = false }: Props) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: MAX_HEIGHT }}>
      {BAR_RATIOS.map((ratio, i) => (
        <div
          key={i}
          style={{
            width:           3,
            height:          isVisible ? `${Math.max(2, ratio * (level / 100) * MAX_HEIGHT)}px` : '2px',
            background:      active ? 'var(--sp-green)' : 'var(--sp-gray2)',
            borderRadius:    2,
            transformOrigin: 'bottom',
            transition:      'height .8s cubic-bezier(.4,0,.2,1), background .2s',
            transitionDelay: `${i * 60}ms`,
            animation:       active ? `eqBounce 0.9s ease-in-out ${i * 0.12}s infinite` : 'none',
          }}
        />
      ))}
    </div>
  );
}
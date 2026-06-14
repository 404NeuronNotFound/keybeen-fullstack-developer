import { useRef, useState } from 'react';
import { clamp } from '../../utils';

interface Props {
  value:     number;
  onChange?: (pct: number) => void;
  accent?:   string;
  height?:   number;
}

export function ProgressBar({ value, onChange, accent = 'var(--sp-green)', height = 4 }: Props) {
  const [hovered, setHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onChange || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    onChange(clamp(((e.clientX - rect.left) / rect.width) * 100));
  };

  return (
    <div
      ref={trackRef}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: hovered ? height + 2 : height, background: '#4d4d4d', borderRadius: 99, cursor: onChange ? 'pointer' : 'default', position: 'relative', transition: 'height .12s' }}
    >
      <div style={{ width: `${clamp(value)}%`, height: '100%', background: hovered ? 'var(--sp-green-h)' : accent, borderRadius: 99, transition: 'width .3s linear', position: 'relative' }}>
        {hovered && onChange && (
          <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, background: '#fff', borderRadius: '50%' }} />
        )}
      </div>
    </div>
  );
}

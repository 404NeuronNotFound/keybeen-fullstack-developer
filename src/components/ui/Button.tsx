import type { ReactNode, MouseEvent, CSSProperties } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface Props {
  children:  ReactNode;
  variant?:  Variant;
  size?:     Size;
  rounded?:  boolean;
  disabled?: boolean;
  onClick?:  (e: MouseEvent<HTMLButtonElement>) => void;
  style?:    CSSProperties;
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '5px 14px',  fontSize: 12 },
  md: { padding: '8px 20px',  fontSize: 13 },
  lg: { padding: '11px 28px', fontSize: 15 },
};

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: { background: 'var(--sp-green)',  color: '#000',              border: 'none', fontWeight: 700 },
  outline: { background: 'transparent',      color: 'var(--sp-white)',   border: '1px solid var(--sp-gray2)', fontWeight: 700 },
  ghost:   { background: 'transparent',      color: 'var(--sp-gray)',    border: 'none', fontWeight: 500 },
};

export function Button({ children, variant = 'outline', size = 'md', rounded = false, disabled = false, onClick, style }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ cursor: disabled ? 'default' : 'pointer', borderRadius: rounded ? 24 : 'var(--radius-sm)', letterSpacing: '.4px', transition: 'background .15s, border-color .15s', opacity: disabled ? 0.5 : 1, ...SIZES[size], ...VARIANTS[variant], ...style }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--sp-green-h)';
        if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--sp-white)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--sp-green)';
        if (variant === 'outline') e.currentTarget.style.borderColor = 'var(--sp-gray2)';
      }}
    >
      {children}
    </button>
  );
}

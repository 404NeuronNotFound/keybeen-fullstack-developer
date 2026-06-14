import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'default' | 'green';
}

const VARIANTS = {
  default: { background: '#333',                      color: '#b3b3b3' },
  green:   { background: 'rgba(29,185,84,0.15)',      color: 'var(--sp-green)' },
} as const;

export function Tag({ children, variant = 'default' }: Props) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 'var(--radius-sm)', ...VARIANTS[variant] }}>
      {children}
    </span>
  );
}

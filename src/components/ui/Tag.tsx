import type { ReactNode } from 'react';

export function Tag({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'green' }) {
  return <span className={`ui-tag ui-tag--${variant}`}>{children}</span>;
}

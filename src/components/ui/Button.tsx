import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
};

export function Button({ children, variant = 'outline', size = 'md', rounded = false, className = '', type = 'button', ...props }: Props) {
  return <button {...props} type={type} className={`ui-button ui-button--${variant} ui-button--${size}${rounded ? ' ui-button--rounded' : ''} ${className}`}>{children}</button>;
}

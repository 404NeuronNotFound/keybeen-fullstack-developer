import type { IconType } from 'react-icons';
import { ChevronRight } from 'lucide-react';

export interface ContactLink {
  icon:  IconType;
  label: string;
  handle: string;
  /** brand color used for the icon and on hover */
  color: string;
  href:  string;
}

interface Props {
  link: ContactLink;
}

export function ContactLinkCard({ link }: Props) {
  const Icon = link.icon;

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background:     'var(--sp-dark2)',
        borderRadius:   'var(--radius-md)',
        padding:        '16px 18px',
        display:        'flex',
        alignItems:     'center',
        gap:            14,
        cursor:         'pointer',
        border:         '1px solid var(--sp-dark3)',
        transition:     'background .15s, border-color .15s, transform .15s',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background  = 'var(--sp-dark3)';
        e.currentTarget.style.borderColor = link.color;
        e.currentTarget.style.transform   = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background  = 'var(--sp-dark2)';
        e.currentTarget.style.borderColor = 'var(--sp-dark3)';
        e.currentTarget.style.transform   = 'translateY(0)';
      }}
    >
      <div
        style={{
          width:          44,
          height:         44,
          borderRadius:   '50%',
          background:     'rgba(255,255,255,.06)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}
      >
        <Icon size={20} color={link.color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-white)', marginBottom: 2 }}>{link.label}</div>
        <div style={{ fontSize: 12, color: 'var(--sp-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.handle}</div>
      </div>
      <ChevronRight size={18} color="var(--sp-gray)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
    </a>
  );
}
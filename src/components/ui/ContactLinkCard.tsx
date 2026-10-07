import type { CSSProperties } from 'react';
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
      className="surface-card contact-link-card"
      style={{ '--contact-accent': link.color } as CSSProperties}
    >
      <div
        style={{
          width:          44,
          height:         44,
          borderRadius:   '50%',
          background:     'var(--sp-overlay)',
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
        <div className="contact-link-handle">{link.handle}</div>
      </div>
      <ChevronRight size={18} color="var(--sp-gray)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
    </a>
  );
}
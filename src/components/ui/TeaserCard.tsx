import { Lock } from 'lucide-react';
import { Tag } from './Tag';
import type { Project } from '../../types';

interface Props {
  project: Project;
}

/** Same shape as ProjectCard, but locked — no play action, "Coming soon" overlay */
export function TeaserCard({ project }: Props) {
  return (
    <div
      style={{
        background:   'var(--sp-dark2)',
        borderRadius: 'var(--radius-md)',
        padding:      16,
        position:     'relative',
        opacity:      0.65,
      }}
    >
      <div
        className={`grad-${project.gradient}`}
        style={{ width: '100%', paddingBottom: '100%', borderRadius: 'var(--radius-sm)', position: 'relative', marginBottom: 14, overflow: 'hidden', filter: 'grayscale(0.4)' }}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, opacity: 0.5 }}>
          {project.emoji}
        </div>
        {/* lock badge */}
        <div
          style={{
            position:       'absolute',
            bottom:         8,
            right:          8,
            width:          36,
            height:         36,
            background:     'rgba(0,0,0,.55)',
            border:         '1px solid rgba(255,255,255,.1)',
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Lock size={14} color="var(--sp-gray)" />
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sp-gray)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {project.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Tag>Coming soon</Tag>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {project.tags.map((t) => <Tag key={t}>{t}</Tag>)}
      </div>
    </div>
  );
}
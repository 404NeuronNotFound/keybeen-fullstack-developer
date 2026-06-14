import { Lock } from 'lucide-react';
import { Tag } from './Tag';
import type { Project } from '../../types';

interface Props {
  project: Project;
  index:   number;
}

/** Same shape as TrackRow, but locked — no play action, "Coming soon" state */
export function TeaserRow({ project, index }: Props) {
  return (
    <tr style={{ opacity: 0.6 }}>
      <td style={{ padding: '10px 16px', width: 40, textAlign: 'center', color: 'var(--sp-gray)', fontSize: 13 }}>
        {index}
      </td>
      <td style={{ padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className={`grad-${project.gradient}`}
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, filter: 'grayscale(0.4)' }}
          >
            {project.emoji}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sp-gray)' }}>{project.title}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
              {project.tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 16px' }}>
        <Tag>Coming soon</Tag>
      </td>
      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
        <Lock size={14} color="var(--sp-gray)" style={{ verticalAlign: 'middle' }} />
      </td>
    </tr>
  );
}
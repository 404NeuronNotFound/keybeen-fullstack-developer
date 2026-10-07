import { Lock } from 'lucide-react';
import { Tag } from './Tag';
import type { Project } from '../../types';
import { useProjectReaderStore } from '../../store';

interface Props {
  project: Project;
  index:   number;
}

/** Same shape as TrackRow, but locked — no play action, "Coming soon" state */
export function TeaserRow({ project, index }: Props) {
  const openProject = useProjectReaderStore((s) => s.openProject);
  return (
    <tr style={{ opacity: 0.6 }}>
      <td style={{ padding: '10px 16px', width: 40, textAlign: 'center', color: 'var(--sp-gray)', fontSize: 13 }}>
        {index}
      </td>
      <td style={{ padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40, 
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            flexShrink: 0,
            filter: 'grayscale(0.4)',
          }}
        >
          <img
            src={project.image}
            alt={project.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
          <div>
            <button type="button" className="project-title-button" aria-label={`View details for ${project.title}`} aria-haspopup="dialog" aria-controls="project-overview" onClick={() => openProject(project)}>{project.title}</button>
            <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
              {project.tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          </div>
        </div>
      </td>
      <td className="hide-on-mobile" style={{ padding: '10px 16px' }}>
        <Tag>Coming soon</Tag>
      </td>
      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
        <Lock size={14} color="var(--sp-gray)" style={{ verticalAlign: 'middle' }} />
      </td>
    </tr>
  );
}

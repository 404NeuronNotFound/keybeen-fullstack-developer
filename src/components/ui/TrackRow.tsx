import { useState } from 'react';
import { Play, Volume2, Heart } from 'lucide-react';
import type { Project } from '../../types';
import { Tag } from './Tag';

interface Props {
  project:   Project;
  index:     number;
  onPlay:    (p: Project) => void;
  isPlaying: boolean;
  isCurrent: boolean;
  isLiked:   boolean;
  onLike:    (id: number) => void;
}

export function TrackRow({ project, index, onPlay, isPlaying, isCurrent, isLiked, onLike }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(project)}
      style={{ background: hovered ? '#2a2a2a' : isCurrent ? '#1c1c1c' : 'transparent', cursor: 'pointer', transition: 'background .1s' }}
    >
      <td style={{ padding: '10px 16px', width: 40, textAlign: 'center', color: isCurrent ? 'var(--sp-green)' : 'var(--sp-gray)', fontSize: 13 }}>
        {isCurrent && isPlaying
          ? <Volume2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          : hovered
            ? <Play size={13} fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }} />
            : index}
      </td>
      <td style={{ padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={`grad-${project.gradient}`} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{project.emoji}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isCurrent ? 'var(--sp-green)' : 'var(--sp-white)' }}>{project.title}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>{project.tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 16px', color: 'var(--sp-gray)', fontSize: 13 }}>{project.plays}</td>
      <td style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(project.id); }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--sp-green)' : 'var(--sp-gray)', display: 'flex', opacity: hovered || isLiked ? 1 : 0, transition: 'opacity .15s, color .15s, transform .1s', transform: isLiked ? 'scale(1.2)' : 'scale(1)', padding: 0, lineHeight: 1 }}
          >
            <Heart size={15} fill={isLiked ? 'var(--sp-green)' : 'none'} />
          </button>
          <span style={{ color: 'var(--sp-gray)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{project.duration}</span>
        </div>
      </td>
    </tr>
  );
}
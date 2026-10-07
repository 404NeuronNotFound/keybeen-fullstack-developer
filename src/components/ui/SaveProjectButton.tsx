import { Heart } from 'lucide-react';
import type { Project } from '../../types';
import { useSavedProjectsStore } from '../../store/savedProjectsStore';

export function SaveProjectButton({ project }: { project: Project }) {
  const saved = useSavedProjectsStore(state => state.savedProjectIds.includes(project.id));
  const toggle = useSavedProjectsStore(state => state.toggleSaved);
  return (
    <button type="button" className="save-project-button" aria-pressed={saved} aria-label={saved ? `Remove ${project.shortTitle} from saved projects` : `Save ${project.shortTitle}`} onClick={event => { event.stopPropagation(); toggle(project.id); }}>
      <Heart size={18} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

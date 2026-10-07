import type { ProjectStatus } from '../../types';
import { projectStatusLabel } from '../../constants/projects';

export function ProjectStatusBadge({ status }: { status?: ProjectStatus }) {
  const label = projectStatusLabel(status);
  return label ? <span className="project-status-badge" data-status={status}>{label}</span> : null;
}

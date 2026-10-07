import type { ProjectStatus } from '../types';

export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'released', label: 'Released' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'archived', label: 'Archived' },
];

export function projectStatusLabel(status?: ProjectStatus) {
  return PROJECT_STATUSES.find(item => item.value === status)?.label;
}

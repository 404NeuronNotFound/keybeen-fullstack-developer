import { projects, experience } from '../data';

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
// A qualified project tag still supplies evidence for the underlying database.
const tagAliases: Record<string, string> = { supabasepostgresql: 'postgresql' };
const normalizeTag = (name: string) => tagAliases[normalize(name)] ?? normalize(name);

export function getSkillProjects(name: string) {
  return projects.filter(project => project.tags.some(tag => normalizeTag(tag) === normalizeTag(name)));
}

export function getSkillContext(name: string, fallback: string) {
  const project = getSkillProjects(name)[0];
  if (project) return `Used in ${project.shortTitle}`;
  const entry = experience.find(item => item.tags.some(tag => normalize(tag) === normalize(name)));
  return entry ? `Used in ${entry.type.toLowerCase()}` : fallback;
}

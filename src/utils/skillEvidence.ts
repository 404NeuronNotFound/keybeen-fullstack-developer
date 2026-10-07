import { projects, experience } from '../data';

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function getSkillProjects(name: string) {
  return projects.filter(project => project.tags.some(tag => normalize(tag) === normalize(name)));
}

export function getSkillContext(name: string, fallback: string) {
  const project = getSkillProjects(name)[0];
  if (project) return `Used in ${project.shortTitle}`;
  const entry = experience.find(item => item.tags.some(tag => normalize(tag) === normalize(name)));
  return entry ? `Used in ${entry.type.toLowerCase()}` : fallback;
}

import type { SkillCategory } from '../types';

export const skills: SkillCategory = {
  Frontend: [
    { name: 'React',        level: 85 },
    { name: 'TypeScript',   level: 82 },
    { name: 'JavaScript',   level: 84 },
    { name: 'Next.js',      level: 78 },
    { name: 'Tailwind CSS', level: 90 },
    { name: 'React Native', level: 72 },
    { name: 'Vue',          level: 90 },
    { name: 'Nuxt.JS',      level: 80 },
  ],
  Backend: [
    { name: 'Node.js',    level: 85 },
    { name: 'Django',     level: 90 },
    { name: 'PostgreSQL', level: 85 },
    { name: 'MySQL',      level: 80 },
    { name: 'MongoDB',    level: 75 },
    { name: 'Laravel',    level: 70 },
  ],
  DevTools: [
    { name: 'Docker',         level: 82 },
    { name: 'ExpoGo',         level: 90 },
    { name: 'Postman',        level: 92 },
    { name: 'GitHub Actions', level: 95 },
    { name: 'Vercel',         level: 90 },
  ],
};

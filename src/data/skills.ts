import type { SkillCategory } from '../types';

export const skills: SkillCategory = {
  Frontend: [
    { name: 'React', description: 'Web interfaces and reusable components' },
    { name: 'TypeScript', description: 'Typed application code' },
    { name: 'JavaScript', description: 'Browser and application logic' },
    { name: 'Next.js', description: 'React web applications' },
    { name: 'Tailwind CSS', description: 'Responsive layouts and styling' },
    { name: 'React Native', description: 'Mobile app interfaces' },
    { name: 'Vue', description: 'Component-based web interfaces' },
    { name: 'Nuxt.JS', description: 'Vue web applications' },
  ],
  Backend: [
    { name: 'Node.js', description: 'Server-side JavaScript' },
    { name: 'Django', description: 'Web backends and application logic' },
    { name: 'PostgreSQL', description: 'Relational data storage' },
    { name: 'MySQL', description: 'Relational data storage' },
    { name: 'MongoDB', description: 'Document-based data storage' },
    { name: 'Laravel', description: 'PHP web applications' },
  ],
  DevTools: [
    { name: 'Docker', description: 'Containerized development environments' },
    { name: 'ExpoGo', description: 'React Native development previews' },
    { name: 'Postman', description: 'API requests and debugging' },
    { name: 'GitHub Actions', description: 'Automated repository workflows' },
    { name: 'Vercel', description: 'Web application hosting' },
  ],
};

// Curated core tools, rather than a ranking based on self-rated percentages.
export const CORE_SKILL_NAMES = ['React', 'Django', 'TypeScript', 'Node.js', 'Tailwind CSS'];

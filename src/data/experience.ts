import type { ExperienceItem } from '../types';

export const experience: ExperienceItem[] = [
  {
    id: 1,
    icon: 'cpu',
    emoji: '⚡',
    role: 'AI-Assisted Full-Stack Developer',
    company: 'Personal Projects',
    period: '2026 - Present',
    type: 'Personal projects',
    description:
      'Building practical web and mobile projects. Findify and CoinFession are completed and awaiting hosting; PaLista and PowerAtomic are completed mobile apps awaiting deployment. Langgam-it is still in progress.',
    tags: ['AI', 'React', 'Next.js', 'React-Native','TypeScript', 'GitHub',],
  },
  {
    id: 2,
    icon: 'monitor',
    emoji: '🖥️',
    role: 'Frontend Developer / Tech Support Intern',
    company: 'MSU Naawan — ICT Center',
    period: '2025',
    type: 'Internship',
    description:
      'Worked on a Document Management System at the MSU Naawan ICT Center using Nuxt and Pinia. My contributions included frontend development, UI design, and reviewing the interface.',
    tags: ['Nuxt.js', 'Pinia', 'UI Design', 'UI Review'],
  },
  {
    id: 3,
    icon: 'graduation',
    emoji: '🎓',
    role: 'Full-Stack Developer — Capstone Project',
    company: 'University Capstone',
    period: '2022 – 2024',
    type: 'Education / Capstone',
    description:
      'Built the Grades Management System as a university capstone, handling the full stack while still learning development. The application is completed and awaiting hosting. Taking responsibility for both the frontend and backend was the hardest part.',
    tags: ['Django', 'Tailwind CSS', 'MySQL', 'REST API', 'GitHub'],
  },
  {
    id: 4,
    icon: 'sparkles',
    emoji: '👋',
    role: 'Hello, World!',
    company: 'Where it all started',
    period: '2020',
    type: 'Learning milestone',
    description:
      "Wrote my very first program a simple \"Hello, World!\", and got hooked on building things with code. The spark that started this whole journey into web development.",
    tags: ['Curiosity', 'First Commit'],
  },

];

import type { IconType } from 'react-icons';
import {
  SiReact, SiTypescript, SiJavascript, SiNextdotjs, SiTailwindcss,
  SiVuedotjs, SiNuxt, SiNodedotjs, SiDjango, SiPostgresql, SiMysql,
  SiMongodb, SiLaravel, SiDocker, SiExpo, SiPostman, SiGithubactions, SiVercel,
} from 'react-icons/si';

// Brand colors from Simple Icons' brand metadata, with a contrasting logo surface.
// https://github.com/simple-icons/simple-icons/blob/develop/data/simple-icons.json
export const TOOL_BRANDS: Record<string, { icon: IconType; color: string; surface: string }> = {
  React: { icon: SiReact, color: '#61DAFB', surface: '#182126' },
  TypeScript: { icon: SiTypescript, color: '#3178C6', surface: '#FFFFFF' },
  JavaScript: { icon: SiJavascript, color: '#F7DF1E', surface: '#182126' },
  'Next.js': { icon: SiNextdotjs, color: '#000000', surface: '#FFFFFF' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#06B6D4', surface: '#182126' },
  'React Native': { icon: SiReact, color: '#61DAFB', surface: '#182126' },
  Vue: { icon: SiVuedotjs, color: '#4FC08D', surface: '#182126' },
  'Nuxt.JS': { icon: SiNuxt, color: '#00DC82', surface: '#182126' },
  'Node.js': { icon: SiNodedotjs, color: '#5FA04E', surface: '#FFFFFF' },
  Django: { icon: SiDjango, color: '#092E20', surface: '#FFFFFF' },
  PostgreSQL: { icon: SiPostgresql, color: '#4169E1', surface: '#FFFFFF' },
  MySQL: { icon: SiMysql, color: '#4479A1', surface: '#FFFFFF' },
  MongoDB: { icon: SiMongodb, color: '#47A248', surface: '#FFFFFF' },
  Laravel: { icon: SiLaravel, color: '#FF2D20', surface: '#FFFFFF' },
  Docker: { icon: SiDocker, color: '#2496ED', surface: '#182126' },
  ExpoGo: { icon: SiExpo, color: '#1C2024', surface: '#FFFFFF' },
  Postman: { icon: SiPostman, color: '#FF6C37', surface: '#182126' },
  'GitHub Actions': { icon: SiGithubactions, color: '#2088FF', surface: '#182126' },
  Vercel: { icon: SiVercel, color: '#000000', surface: '#FFFFFF' },
};

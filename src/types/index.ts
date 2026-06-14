// ─── Domain models ────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  emoji: string;
  title: string;
  /** "m:ss" format, e.g. "4:11" */
  duration: string;
  /** display string, e.g. "128K" */
  plays: string;
  /** CSS class suffix: "emerald" | "blue" | "yellow" | "purple" | "teal" | "zinc" */
  gradient: string;
  tags: string[];
  description: string;
  year: string;
  github: string;
  live: string;
  featured: boolean;
}

export interface Skill {
  name: string;
  /** 0 – 100 */
  level: number;
}

export type SkillCategory = Record<string, Skill[]>;

export interface ExperienceItem {
  id: number;
  emoji: string;
  role: string;
  company: string;
  period: string;
  type: string;
  description: string;
  tags: string[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'contact';

export interface NavItem {
  id: SectionId;
  icon: string;
  label: string;
}

// ─── Site config ──────────────────────────────────────────────────────────────

export interface StatItem {
  value: string;
  label: string;
}

export interface SiteConfig {
  name: string;
  fullName: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  initials: string;
  stats: StatItem[];
  instagram: string;
  tiktok: string;
}

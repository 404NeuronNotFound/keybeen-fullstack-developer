// ─── Domain models ────────────────────────────────────────────────────────────

export type ProjectStatus = 'released' | 'completed' | 'in-progress' | 'prototype' | 'archived';

export interface ProjectCaseStudy {
  problem: string;
  intendedUsers: string;
  role: string;
  constraints: string[];
  decisions: string[];
  screenshots: { src: string; caption: string }[];
  outcome: string;
  lessons: string[];
  nextSteps: string[];
  linerNote: string;
}

export interface Project {
  id: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: string;
  accent: string;
  /** Set only after the project owner confirms its actual status. */
  status?: ProjectStatus;
  availability?: string;
  /** Only publish confirmed first-person facts and genuine screenshot captions. */
  caseStudy?: ProjectCaseStudy;
  /** CSS class suffix: "emerald" | "blue" | "yellow" | "purple" | "teal" | "zinc" */
  gradient: string;
  tags: string[];
  description: string;
  year: string;
  github?: string;
  live?: string;
  featured: boolean;
  image?: string; // Optional property for image path
}

export interface Skill {
  name: string;
  /** 0 – 100 */
  level: number;
}

export type SkillCategory = Record<string, Skill[]>;

export interface ExperienceItem {
  id: number;
  icon: 'cpu' | 'monitor' | 'graduation' | 'sparkles';
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
  intro: string;
  personalNote: string;
  resumeUrl?: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  initials: string;
  stats: StatItem[];
  instagram: string;
  instagramUsername: string;
  tiktok: string;
  tiktokUsername: string;
  githubUsername: string;
}

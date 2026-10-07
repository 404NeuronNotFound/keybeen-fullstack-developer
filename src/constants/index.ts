import { Home, User, Code2, Briefcase, LayoutGrid, Mail, type LucideIcon } from 'lucide-react';
import type { SectionId, SiteConfig } from '../types';


const INSTAGRAM_USERNAME = 'kxvxn.js';
const TIKTOK_USERNAME = 'keybeen.creatives';
const GITHUB_USERNAME = '404NeuronNotFound';

export const SITE: SiteConfig = {
  name:     'Keybeen',
  fullName: 'Keybeen',
  role:     'AI Assisted Full-Stack App & Web Developer',
  tagline:  'Building things for the web & beyond',
  intro: 'I build practical web and mobile apps for schools, small shops, and everyday problems.',
  personalNote: 'Based in Cagayan de Oro. My coding journey started with a simple “Hello, World!”',
  location: 'Cagayan De Oro, PH',
  email:    'keybeen.webdeveloper@gmail.com',
  github:   `https://github.com/${GITHUB_USERNAME}`,
  githubUsername: GITHUB_USERNAME,
  linkedin: 'https://linkedin.com/in/kxvxn',
  twitter:  'https://twitter.com/kxvxn',
  website:  'https://keybeen-fullstack-developer.vercel.app/',
  instagram: `https://instagram.com/${INSTAGRAM_USERNAME}`,
  instagramUsername: INSTAGRAM_USERNAME,
  tiktok: `https://tiktok.com/@${TIKTOK_USERNAME}`,
  tiktokUsername: TIKTOK_USERNAME,
  initials: 'KR',

  stats: [
    { value: '3+',  label: 'Years exp.'    },
    { value: '7', label: 'Projects'      },
    { value: '19',  label: 'Technologies'  },
  ],
};

export interface NavItem {
  id: SectionId;
  icon: LucideIcon;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home',       icon: Home,        label: 'Home'       },
  { id: 'about',      icon: User,        label: 'About'       },
  { id: 'skills',     icon: Code2,       label: 'Skills'     },
  { id: 'experience', icon: Briefcase,   label: 'Experience' },
  { id: 'projects',   icon: LayoutGrid,  label: 'Projects'   },
  { id: 'contact',    icon: Mail,        label: 'Contact'    },
];

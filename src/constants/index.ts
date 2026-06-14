import { Home, User, Code2, Briefcase, LayoutGrid, Mail, type LucideIcon } from 'lucide-react';
import type { SectionId, SiteConfig } from '../types';


export const SITE: SiteConfig = {
  name:     'Keybeen',
  fullName: 'Keybeen',
  role:     'Ai Assisted Full-Stack App & Web Developer',
  tagline:  'Building things for the web & beyond',
  location: 'Cagayan De Oro, PH',
  email:    'keybeen.webdeveloper@gmail.com',
  github:   'https://github.com/404NeuronNotFound',
  linkedin: 'https://linkedin.com/in/kxvxn',
  twitter:  'https://twitter.com/kxvxn',
  website:  'https://kxvxn.dev',
  instagram: 'https://instagram.com/kxvxn',
  tiktok: 'https://tiktok.com/@keybeen.creatives',
  initials: 'KR',

  stats: [
    { value: '3+',  label: 'Years exp.'    },
    { value: '6', label: 'Projects'      },
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

export const NOW_CODING_INTERVAL = 3_800; // ms
export const PLAYER_TICK         = 300;   // ms per progress tick
export const PLAYER_STEP         = 0.25;  // progress % per tick

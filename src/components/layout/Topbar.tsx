import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Moon, Sun, Volume2, VolumeX, User, Mail, FileDown } from 'lucide-react';
import { useNavStore, useThemeStore, useSoundStore } from '../../store';
import { primeAudio } from '../../hooks/useHoverSound';
import { SITE, NAV_ITEMS } from '../../constants';
import { Avatar }        from '../../components/ui';
import type { LucideIcon } from 'lucide-react';

interface ArrowBtnProps {
  label:   string;
  onClick: () => void;
  enabled: boolean;
  Icon:    LucideIcon;
}

function ArrowBtn({ label, onClick, enabled, Icon }: ArrowBtnProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={!enabled}
      className="icon-button history-button"
      type="button"
    >
      <Icon size={18} />
    </button>
  );
}

export function Topbar() {
  const active = useNavStore((s) => s.active);
  const navigate = useNavStore((s) => s.navigate);
  const pageTitle = NAV_ITEMS.find(item => item.id === active)?.label ?? 'Home';
  const profileRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const back       = useNavStore((s) => s.back);
  const forward    = useNavStore((s) => s.forward);
  const canBack    = useNavStore((s) => s.histIdx > 0);
  const canForward = useNavStore((s) => s.histIdx < s.history.length - 1);
  const theme      = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isLight    = theme === 'light';

  const muted       = useSoundStore((s) => s.muted || !s.musicOptedIn);
  const toggleMuted = useSoundStore((s) => s.toggleMuted);
  const toggleSound = () => { toggleMuted(); primeAudio(); };
  const goTo = (section: 'about' | 'contact') => {
    profileRef.current?.hidePopover();
    profileTriggerRef.current?.focus({ preventScroll: true });
    navigate(section);
  };

  return (
    <header className="topbar">
      <div className="topbar-history hide-on-mobile">
        <ArrowBtn label="Go back"    onClick={back}    enabled={canBack}    Icon={ChevronLeft} />
        <ArrowBtn label="Go forward" onClick={forward} enabled={canForward} Icon={ChevronRight} />
      </div>

      <span className="topbar-page-title" aria-live="polite" aria-atomic="true">
        {pageTitle}
      </span>

      <div className="topbar-actions">
        {/* theme toggle */}
        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={toggleTheme}
          aria-label="Light mode"
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-pressed={isLight}
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* sound toggle — the onClick here is a genuine user gesture,
            which is what actually unlocks AudioContext in the browser.
            Hover sounds will not play until this has been clicked once. */}
        <button
          onClick={toggleSound}
          aria-label="Sounds and avatar music"
          title={muted ? 'Unmute sounds and avatar music' : 'Mute sounds and avatar music'}
          type="button"
          className="icon-button"
          aria-pressed={!muted}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          type="button"
          id="profile-menu-trigger"
          ref={profileTriggerRef}
          className="profile-menu-trigger"
          popoverTarget="profile-menu"
          aria-controls="profile-menu"
          aria-expanded={profileOpen}
          aria-label={profileOpen ? 'Close profile options' : 'Open profile options'}
        >
          <span aria-hidden="true" style={{ pointerEvents: 'none' }}><Avatar size={28} /></span>
          <span className="hide-on-mobile">{SITE.name}</span>
          <ChevronDown size={14} aria-hidden="true" className="hide-on-mobile" />
        </button>
      </div>

      <div id="profile-menu" ref={profileRef} className="profile-menu" popover="auto" role="group" aria-labelledby="profile-menu-title" onToggle={event => setProfileOpen(event.newState === 'open')}>
        <p id="profile-menu-title" className="profile-menu-title">{SITE.name}</p>
        <button type="button" onClick={() => goTo('about')}><User size={16} aria-hidden="true" />About me</button>
        <button type="button" onClick={() => goTo('contact')}><Mail size={16} aria-hidden="true" />Contact</button>
        {SITE.resumeUrl ? (
          <a href={SITE.resumeUrl} download onClick={() => profileRef.current?.hidePopover()}><FileDown size={16} aria-hidden="true" />Download resume</a>
        ) : (
          <button type="button" onClick={() => goTo('contact')}><FileDown size={16} aria-hidden="true" />Request resume</button>
        )}
        <button type="button" onClick={toggleSound} aria-pressed={!muted}>{muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}{muted ? 'Sounds off · enable' : 'Sounds on · mute'}</button>
      </div>
    </header>
  );
}

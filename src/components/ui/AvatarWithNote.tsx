import { useState } from 'react';
import { Avatar } from './Avatar';
import { NoteBubble } from './NoteBubble';

interface Props {
  size?: number;
  src?: string;
  hoverSrc?: string;
  alt?: string;
  /** the status message shown in the note bubble on hover */
  note?: string;
}

/**
 * Drop-in replacement for a bare <Avatar /> in a larger context (e.g. Hero
 * section). Hovering shows a Messenger-"Notes"-style speech bubble that
 * overlaps the top-left of the avatar (by design — keeps it clear of
 * anything sticky above the section, like a topbar), rendered above the
 * photo via z-index. Shares hover state with Avatar's own effect
 * (glitch/sound/etc).
 */
export function AvatarWithNote({
  size = 96,
  src,
  hoverSrc,
  alt,
  note = "With great coffee comes great productivity.",
}: Props) {
  const [hov, setHov] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const revealed = hov || focused || pinned;

  return (
    <button
      type="button"
      className="portrait-reveal"
      aria-label="Toggle alternate portrait"
      aria-pressed={revealed}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setFocused(true); }}
      onBlur={() => { setFocused(false); setPinned(false); setHov(false); }}
      onClick={() => {
        setPinned(!revealed);
        setFocused(false);
        setHov(false);
      }}
      onKeyDown={event => { if (event.key === 'Escape') { setHov(false); setFocused(false); setPinned(false); } }}
      style={{ position: 'relative', display: 'block', overflow: 'visible', border: 'none', borderRadius: '50%', padding: 0, background: 'transparent', cursor: 'pointer' }}
    >
      <NoteBubble show={revealed} text={note} />
      <Avatar size={size} src={src} hoverSrc={hoverSrc} alt={alt} revealed={revealed} />
    </button>
  );
}

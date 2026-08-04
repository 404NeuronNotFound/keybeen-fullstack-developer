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

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', display: 'block', overflow: 'visible' }}
    >
      <NoteBubble show={hov} text={note} />
      <Avatar size={size} src={src} hoverSrc={hoverSrc} alt={alt} />
    </div>
  );
}
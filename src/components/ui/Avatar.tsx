import { useState } from 'react';
import { SITE } from '../../constants';

interface Props {
  /** diameter in px */
  size?: number;
  /** path relative to /public, e.g. "/avatar.jpg" */
  src?: string;
  alt?: string;
}

/**
 * Circular avatar. Drop your photo at `public/avatar.jpg` (or .png/.webp)
 * and it will be used automatically — falls back to initials if missing.
 */
export function Avatar({ size = 40, src = '/avatar.jpeg', alt }: Props) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      style={{
        width:        size,
        height:       size,
        borderRadius: '50%',
        overflow:     'hidden',
        flexShrink:   0,
        background:   'linear-gradient(135deg, #1DB954 0%, #148a3d 100%)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        userSelect:   'none',
      }}
    >
      {!errored && (
        <img
          src={src}
          alt={alt ?? `${SITE.fullName} avatar`}
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      )}
      {errored && (
        <span
          style={{
            fontSize:      size * 0.32,
            fontWeight:    900,
            color:         '#fff',
            letterSpacing: '-1px',
          }}
        >
          {SITE.initials}
        </span>
      )}
    </div>
  );
}
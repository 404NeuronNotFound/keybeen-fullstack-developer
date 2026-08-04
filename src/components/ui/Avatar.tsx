import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE } from '../../constants';
import { useHoverSound } from '../../hooks/useHoverSound';

interface Props {
  /** diameter in px */
  size?: number;
  /** path relative to /public, e.g. "/avatar.jpg" */
  src?: string;
  /** path relative to /public for the hover reveal image, e.g. "/avatar-spiderman.jpg".
   *  Drop your own image here — this component won't source one for you. */
  hoverSrc?: string;
  alt?: string;
}

/**
 * Circular avatar. Drop your photo at `public/avatar.jpg` (or .png/.webp)
 * and it will be used automatically — falls back to initials if missing.
 *
 * On hover: a comic-print glitch effect (RGB channel split, halftone dot
 * screen, scanline flicker) plays over the normal photo while it dissolves
 * away, revealing `hoverSrc` (e.g. `public/avatar-spiderman.jpg`)
 * underneath — synced with a synthesized digital-glitch sound burst.
 * Reverses cleanly on mouse-leave.
 */
export function Avatar({ size = 40, src = '/avatar.jpeg', hoverSrc = '/avatar-spiderman.jpeg', alt }: Props) {
  const [errored, setErrored]           = useState(false);
  const [hoverErrored, setHoverErrored] = useState(false);
  const [hov, setHov]                   = useState(false);
  const playSound = useHoverSound();

  const handleEnter = () => {
    setHov(true);
    playSound('glitch');
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHov(false)}
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        overflow:       'hidden',
        flexShrink:     0,
        position:       'relative',
        background:     'linear-gradient(135deg, #1DB954 0%, #148a3d 100%)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        userSelect:     'none',
        cursor:         'pointer',
      }}
    >
      {/* base layer — the reveal image, always mounted underneath */}
      {!hoverErrored && (
        <img
          src={hoverSrc}
          alt="Alter ego"
          onError={() => setHoverErrored(true)}
          style={{
            position:       'absolute',
            inset:          0,
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: 'center center',
          }}
        />
      )}

      {/* top layer — the normal avatar photo, glitches away on hover */}
      <AnimatePresence>
        {!errored && (
          <motion.img
            key="primary"
            src={src}
            alt={alt ?? `${SITE.fullName} avatar`}
            onError={() => setErrored(true)}
            initial={false}
            animate={{ opacity: hov ? 0 : 1 }}
            transition={{ duration: 0.32, delay: hov ? 0.22 : 0 }}
            style={{
              position:       'absolute',
              inset:          0,
              width:          '100%',
              height:         '100%',
              objectFit:      'cover',
              objectPosition: 'center top',
              zIndex:         2,
            }}
          />
        )}
      </AnimatePresence>

      {/* glitch overlay — plays only during the transition burst on hover */}
      <AnimatePresence>
        {hov && !errored && (
          <motion.div
            key="glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06 }}
            style={{ position: 'absolute', inset: 0, zIndex: 3 }}
          >
            {/* red channel, offset + jittering */}
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              animate={{ x: [-4, 3, -3, 4, -1, 0], y: [1, -2, 1, -1, 0, 0], opacity: [0.8, 0.8, 0.6, 0.4, 0.1, 0] }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                mixBlendMode: 'screen',
                filter: 'sepia(1) saturate(8) hue-rotate(-50deg) brightness(1.1)',
              }}
            />
            {/* cyan channel, offset the other way */}
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              animate={{ x: [4, -3, 3, -4, 1, 0], y: [-1, 2, -1, 1, 0, 0], opacity: [0.8, 0.8, 0.6, 0.4, 0.1, 0] }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                mixBlendMode: 'screen',
                filter: 'sepia(1) saturate(8) hue-rotate(140deg) brightness(1.1)',
              }}
            />

            {/* halftone dot screen — mimics comic-print dot patterning */}
            <motion.div
              animate={{ opacity: [0.55, 0.55, 0.3, 0.15, 0] }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.55) 0.6px, transparent 0.6px)',
                backgroundSize: '3px 3px',
                mixBlendMode: 'multiply',
              }}
            />

            {/* scanline flicker */}
            <motion.div
              animate={{ opacity: [0.3, 0.1, 0.35, 0.05, 0] }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0px, rgba(255,255,255,.5) 1px, transparent 1px, transparent 3px)',
                mixBlendMode: 'overlay',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* initials fallback — only shown if BOTH images are missing */}
      {errored && hoverErrored && (
        <span
          style={{
            fontSize:      size * 0.32,
            fontWeight:    900,
            color:         '#fff',
            letterSpacing: '-1px',
            position:      'relative',
            zIndex:        1,
          }}
        >
          {SITE.initials}
        </span>
      )}
    </div>
  );
}
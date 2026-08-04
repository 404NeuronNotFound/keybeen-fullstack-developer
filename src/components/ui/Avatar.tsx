import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE } from '../../constants';
import { useHoverSound } from '../../hooks/useHoverSound';
import { useYouTubeBackgroundAudio } from '../../hooks/useYouTubeBackgroundAudio';

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

const GONE_GONE_GONE_VIDEO_ID  = 'oozQ4yV__Vw'; // Phillip Phillips — Gone, Gone, Gone
const GONE_GONE_GONE_START_SEC = 98;            // 1:38
const GLITCH_DURATION_MS       = 320;           // matches the glitch overlay's on-screen duration below

/**
 * Circular avatar. Drop your photo at `public/avatar.jpg` (or .png/.webp)
 * and it will be used automatically — falls back to initials if missing.
 *
 * On hover: a synthesized digital-glitch sound plays immediately, a
 * comic-print glitch effect (RGB channel split, halftone dot screen,
 * scanline flicker) plays over the photo while it dissolves away to
 * reveal `hoverSrc` underneath, and once the glitch finishes, music
 * starts playing via a hidden YouTube embed (not a downloaded file —
 * the audio stays on YouTube's platform, this just remote-controls
 * their official player) seeked to 1:38. Music stops on mouse-leave.
 */
export function Avatar({ size = 40, src = '/avatar.jpeg', hoverSrc = '/avatar-spiderman.jpeg', alt }: Props) {
  const [errored, setErrored]           = useState(false);
  const [hoverErrored, setHoverErrored] = useState(false);
  const [hov, setHov]                   = useState(false);
  const { playGlitch }   = useHoverSound();
  const { playFrom, stop } = useYouTubeBackgroundAudio(GONE_GONE_GONE_VIDEO_ID);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    setHov(true);
    playGlitch();
    if (playTimer.current) clearTimeout(playTimer.current);
    playTimer.current = window.setTimeout(() => playFrom(GONE_GONE_GONE_START_SEC), GLITCH_DURATION_MS);
  };

  const handleLeave = () => {
    setHov(false);
    if (playTimer.current) { clearTimeout(playTimer.current); playTimer.current = null; }
    stop();
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
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
              animate={{ x: [-4, 3, -3, 4, -1, 0], y: [1, -2, 1, -1, 0, 0], opacity: [0.75, 0.75, 0.6, 0.35, 0.08, 0] }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                mixBlendMode: 'lighten',
                filter: 'sepia(1) saturate(6.5) hue-rotate(-50deg) brightness(1)',
              }}
            />
            {/* cyan channel, offset the other way */}
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              animate={{ x: [4, -3, 3, -4, 1, 0], y: [-1, 2, -1, 1, 0, 0], opacity: [0.75, 0.75, 0.6, 0.35, 0.08, 0] }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                mixBlendMode: 'lighten',
                filter: 'sepia(1) saturate(6.5) hue-rotate(140deg) brightness(1)',
              }}
            />
            {/* darkening pass — keeps the channel-split from washing out to white,
                since red+cyan under an additive "screen" blend sum toward white */}
            <motion.img
              src={src}
              alt=""
              aria-hidden="true"
              animate={{ opacity: [0.5, 0.5, 0.4, 0.25, 0.05, 0] }}
              transition={{ duration: 0.3, ease: 'linear' }}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                mixBlendMode: 'multiply',
                filter: 'brightness(0.6) saturate(1.2)',
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

      {/* hidden YouTube player — portaled to document.body so React never has
          to reconcile DOM siblings around a node that YouTube's own script
          mutates directly (that mismatch is what caused the insertBefore
          crash when it lived inline here, next to the AnimatePresence
          glitch overlay). */}
      {/* {createPortal(
        <div id={containerId} style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1 }} />,
        document.body
      )} */}
    </div>
  );
}
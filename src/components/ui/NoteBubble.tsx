import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  text: string;
}

/**
 * Big comic-style speech bubble (rounded rectangle body + a curved tail
 * flowing down-left), overlapping the top-left of the avatar by design —
 * keeps it clear of anything sticky above the section (e.g. a topbar)
 * since it doesn't need empty space above the avatar to live in, and
 * renders in front of the photo via z-index instead.
 */
export function NoteBubble({ show, text }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 6, transition: { duration: 0.15 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          style={{
            position: 'absolute',
            bottom: '74%',
            left: '32%',
            zIndex: 60, // above Avatar's own internal layers (glitch overlay maxes at 3)
            transformOrigin: 'bottom left',
            filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.5))', // shadow follows the COMBINED bubble+tail silhouette
          }}
        >
          {/* curved tail — a fixed-size SVG shape flowing from the bubble's
              bottom-left corner down into the top-left of the avatar */}
          <svg
            width="46"
            height="46"
            viewBox="0 0 46 46"
            style={{ position: 'absolute', bottom: -24, left: 18, pointerEvents: 'none' }}
          >
            <path
              d="M18,0 C16,18 10,28 0,36 C16,33 27,23 30,8 C26,6 21,3 18,0 Z"
              fill="var(--sp-green)"
            />
          </svg>

          <div
            style={{
              position: 'relative',
              background: 'var(--sp-green)',
              color: '#04140a',
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.3,
              padding: '18px 24px',
              borderRadius: 28,
              maxWidth: 260,
              width: 'max-content',
              whiteSpace: 'normal',
              textAlign: 'left',
              boxShadow: '0 0 0 1px rgba(255,255,255,.08)',
            }}
          >
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
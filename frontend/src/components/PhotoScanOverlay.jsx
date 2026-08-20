import { AnimatePresence, motion } from "framer-motion";
import { reduceMotion } from "../lib/motion";

const MotionDiv = motion.div;

// Dominant motion for the photo-analysis loading state — a solid scan line
// sweeps down the captured photo, with a few small trailing dots riding
// the exact same position value. One shared driver (not two independent
// animations) is what guarantees the dots stay locked to the line instead
// of drifting into competing rhythms. Sits on top of AmbientGlow (still
// active behind it, unchanged) — AmbientGlow supplies ambient warmth,
// this supplies the literal "actively scanning" read.
//
// Deliberately linear, not eased — a constant-velocity sweep reads as
// mechanical/scanning, distinct from the organic eased-breathing motion
// used everywhere else (AmbientGlow, the Settings egg/heart).
function PhotoScanOverlay({ active }) {
  // Reduced motion: renders nothing at all rather than a frozen line — a
  // motionless bar sitting mid-photo wouldn't communicate "processing" the
  // way AmbientGlow's own static-opacity fallback still does through
  // presence alone.
  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {active && (
        <MotionDiv
          style={styles.scanHead}
          initial={{ top: "-8%", opacity: 0 }}
          animate={{ top: "108%", opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{
            top: { duration: 3.6, repeat: Infinity, repeatType: "loop", ease: "linear" },
            opacity: {
              duration: 3.6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
              times: [0, 0.08, 0.92, 1],
            },
          }}
        >
          {/* Comet-tail: gaps between dots widen and opacity/size taper
              geometrically further back, so the trail thins into nothing
              rather than cutting off after a few evenly-spaced dots. */}
          <div style={{ ...styles.dot, top: "-61px", opacity: 0.02, width: "2px", height: "2px" }} />
          <div style={{ ...styles.dot, top: "-46px", opacity: 0.04, width: "2px", height: "2px" }} />
          <div style={{ ...styles.dot, top: "-33px", opacity: 0.08, width: "2.5px", height: "2.5px" }} />
          <div style={{ ...styles.dot, top: "-22px", opacity: 0.15, width: "2.5px", height: "2.5px" }} />
          <div style={{ ...styles.dot, top: "-13px", opacity: 0.26 }} />
          <div style={{ ...styles.dot, top: "-6px", opacity: 0.42 }} />
          <div style={styles.line} />
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

const styles = {
  scanHead: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 2,
    pointerEvents: "none",
  },

  line: {
    height: "2px",
    width: "100%",
    background: "var(--oxblood)",
    boxShadow: "0 0 8px rgba(var(--oxblood-rgb), 0.6)",
  },

  dot: {
    position: "absolute",
    left: "50%",
    width: "3px",
    height: "3px",
    borderRadius: "50%",
    background: "var(--oxblood)",
    transform: "translateX(-50%)",
  },
};

export default PhotoScanOverlay;

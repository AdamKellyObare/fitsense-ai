import { AnimatePresence, motion } from "framer-motion";
import { reduceMotion } from "../lib/motion";

const MotionDiv = motion.div;

// Restrained ambient pulse shown while waiting on a real AI response (meal
// estimation, photo generation). Deliberately "contained" — never bleeds
// past its parent's own edges — rather than a looser escaping glow: some
// call sites (MealPhoto's own wrapper, Meals.jsx's card) already clip with
// overflow:hidden, so one contained treatment works everywhere without
// needing a separate bleeding variant, and it reads calmer either way.
//
// Only opacity/scale animate — the blur radius itself is static, so this
// stays compositor-only (no per-frame layout/paint cost).
function AmbientGlow({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <MotionDiv
          style={styles.glow}
          initial={{ opacity: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.5 }
              : { opacity: [0.35, 0.65, 0.35], scale: [0.96, 1.02, 0.96] }
          }
          // exit needs its own short, non-repeating transition — without
          // this it inherits the looping transition below (duration: 2.4,
          // repeat: Infinity), which AnimatePresence never resolves as
          // "complete," so the element lingers on screen well past when
          // `active` goes false instead of settling promptly.
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
      )}
    </AnimatePresence>
  );
}

const styles = {
  glow: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle, rgba(var(--oxblood-rgb), 0.35) 0%, rgba(var(--oxblood-rgb), 0) 70%)",
    filter: "blur(28px)",
  },
};

export default AmbientGlow;

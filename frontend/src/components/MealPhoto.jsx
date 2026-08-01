import { motion } from "framer-motion";

const MotionDiv = motion.div;

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The AI-generated photo (see backend/services/photo_generator.py) finishes
// after the meal is already logged — until photo_status is "ready", this
// shows the same stock placeholder photo_matcher.js always has, with a
// subtle pulse so the eventual swap reads as intentional, not a flicker.
function MealPhoto({ meal, style }) {
  const src =
    meal.photo_status === "ready" && meal.generated_photo_url
      ? meal.generated_photo_url
      : `/food/${meal.photo_key || "generic-1"}.jpg`;

  const isPending = meal.photo_status === "pending";

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      <img src={src} alt={meal.food} style={styles.img} />

      {isPending && (
        <MotionDiv
          style={styles.pendingOverlay}
          animate={reduceMotion ? { opacity: 0.45 } : { opacity: [0.25, 0.5, 0.25] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

const styles = {
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  pendingOverlay: {
    position: "absolute",
    inset: 0,
    background: "var(--oxblood)",
    pointerEvents: "none",
  },
};

export default MealPhoto;

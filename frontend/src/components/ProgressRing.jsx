import { useEffect, useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";
import { reduceMotion } from "../lib/motion";

const MotionCircle = motion.circle;

function ProgressRing({
  value,
  max,
  size = 176,
  strokeWidth = 14,
  unit,
  caption,
  showOverage = false,
  justLogged = false,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - percent);
  const displayValue = useCountUp(value);

  // useAnimate (ref + imperative animate()), not useAnimation's controls-
  // object indirection — the latter is documented as "Legacy" and its
  // start() silently no-ops if the subscriber-list wiring doesn't attach
  // (confirmed: the effect fired with the right values, .start() was
  // called, and nothing ever animated). useAnimate operates directly on
  // the DOM node via the scope ref instead, sidestepping that entirely.
  //
  // Also not a declarative animate={{scale:[...]}} prop — useCountUp's
  // onUpdate fires on every animation frame while the number counts up, so
  // a freshly-recreated inline keyframe array on each of those re-renders
  // would restart/stutter the bump instead of playing once. This only
  // fires when value has actually changed while justLogged is true,
  // regardless of how many unrelated re-renders happen in between.
  const [scope, animate] = useAnimate();
  const prevValueRef = useRef(value);

  useEffect(() => {
    const changed = value !== prevValueRef.current;
    prevValueRef.current = value;
    if (changed && justLogged && !reduceMotion) {
      // Deliberately shorter than the 0.9s ring-fill/0.8s count-up — a
      // quick, quiet "kick" felt at the start rather than a bump that
      // takes the full fill duration to resolve, which would read as
      // effortful rather than a brief confirmation.
      animate(scope.current, { scale: [1, 1.03, 1] }, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    }
  }, [value, justLogged, animate, scope]);

  // Overage ring: a thin arc just outside the main ring, in a lower-opacity
  // shade of the same accent (intensity, not a new color) — represents how
  // far past 100% of target value is, capped at another full target's worth
  // so an extreme overage doesn't visually run away.
  const isOver = showOverage && max > 0 && value > max;
  const overageRadius = radius + strokeWidth / 2 + 4;
  const overageCircumference = 2 * Math.PI * overageRadius;
  const overagePercent = isOver ? Math.min((value - max) / max, 1) : 0;
  const overageOffset = overageCircumference * (1 - overagePercent);
  const overageStrokeWidth = strokeWidth * 0.4;

  return (
    <div ref={scope} style={{ ...styles.wrap, width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: "visible", transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={strokeWidth}
        />
        <MotionCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--oxblood)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        {isOver && (
          <MotionCircle
            cx={size / 2}
            cy={size / 2}
            r={overageRadius}
            fill="none"
            stroke="rgba(var(--oxblood-rgb), 0.4)"
            strokeWidth={overageStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={overageCircumference}
            initial={{ strokeDashoffset: overageCircumference }}
            animate={{ strokeDashoffset: overageOffset }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </svg>

      <div style={styles.center}>
        <div style={styles.value}>{displayValue}</div>
        {unit && <div style={styles.unit}>{unit}</div>}
        {caption && <div style={styles.caption}>{caption}</div>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    flexShrink: 0,
  },

  center: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  value: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "36px",
    color: "var(--ink)",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },

  unit: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
    marginTop: "4px",
  },

  caption: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "var(--graphite)",
    marginTop: "6px",
    textAlign: "center",
    padding: "0 8px",
  },
};

export default ProgressRing;

import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

const MotionCircle = motion.circle;

function ProgressRing({ value, max, size = 176, strokeWidth = 14, unit, caption, showOverage = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - percent);
  const displayValue = useCountUp(value);

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
    <div style={{ ...styles.wrap, width: size, height: size }}>
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

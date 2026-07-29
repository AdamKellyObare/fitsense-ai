import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

const MotionCircle = motion.circle;

function ProgressRing({ value, max, size = 176, strokeWidth = 14, unit, caption }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - percent);
  const displayValue = useCountUp(value);

  return (
    <div style={{ ...styles.wrap, width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
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

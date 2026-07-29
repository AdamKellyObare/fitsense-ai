import { useCountUp } from "../hooks/useCountUp";

function StatCard({ label, value, unit, icon }) {
  const displayValue = useCountUp(value);

  return (
    <div style={styles.card}>
      {icon({ size: 23, strokeWidth: 2.4, color: "var(--ink)" })}

      <div>
        <p style={styles.label}>{label}</p>
        <h2 style={styles.value}>
          {displayValue}
          <span style={styles.unit}> {unit}</span>
        </h2>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: "140px",
    flex: 1,
    transition: "transform var(--duration-hover) var(--ease-out), box-shadow var(--duration-hover) ease",
  },

  label: {
    margin: 0,
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.04em",
    color: "var(--graphite)",
  },

  value: {
    margin: 0,
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "24px",
    color: "var(--ink)",
    fontVariantNumeric: "tabular-nums",
  },

  unit: {
    fontFamily: "var(--font-mono)",
    fontWeight: "500",
    fontSize: "13px",
    color: "var(--graphite)",
  },
};

export default StatCard;

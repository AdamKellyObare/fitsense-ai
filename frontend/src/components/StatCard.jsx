function StatCard({ label, value, unit, icon, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "18px",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      backdropFilter: "blur(10px)",
      minWidth: "140px",
      flex: 1
    }}>
      <div style={{ fontSize: "28px" }}>{icon}</div>

      <div>
        <p style={{
          margin: 0,
          fontSize: "13px",
          opacity: 0.7
        }}>
          {label}
        </p>

        <h2 style={{
          margin: 0,
          color: color || "white"
        }}>
          {value} {unit}
        </h2>
      </div>
    </div>
  );
}

export default StatCard;

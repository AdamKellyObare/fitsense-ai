function TopBar({ userEmail, onLogout }) {
  return (
    <div style={styles.topbar}>
      <div style={styles.brand}>
        <div style={styles.logo}>F</div>
        <div>
          <h2 style={styles.title}>FitSense AI</h2>
          <p style={styles.subtitle}>AI-powered nutrition tracking</p>
        </div>
      </div>

      <div style={styles.rightSide}>
        {userEmail && <span style={styles.status}>{userEmail}</span>}
        {onLogout && (
          <button onClick={onLogout} style={styles.logoutButton}>
            Log out
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    width: "100%",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    background: "rgba(18, 18, 18, 0.9)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logo: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #00ff87, #60efff)",
    color: "#07111f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    lineHeight: "22px",
  },

  subtitle: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  rightSide: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  status: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: "14px",
  },

  logoutButton: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },
};

export default TopBar;
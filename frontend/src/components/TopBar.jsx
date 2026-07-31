import { useViewport } from "../hooks/useViewport";

function TopBar({ userEmail, onLogout }) {
  const { isMobile } = useViewport();

  return (
    <div
      style={{
        ...styles.topbar,
        paddingLeft: isMobile ? "16px" : "40px",
        paddingRight: isMobile ? "16px" : "40px",
      }}
    >
      <div style={styles.brand}>
        <div style={styles.logo}>F</div>
        <div style={styles.brandText}>
          <h2 style={styles.title}>FitSense AI</h2>
          {!isMobile && <p style={styles.subtitle}>AI-powered nutrition tracking</p>}
        </div>
      </div>

      <div style={styles.rightSide}>
        {userEmail && (
          <span style={{ ...styles.status, maxWidth: isMobile ? "110px" : "260px" }}>
            {userEmail}
          </span>
        )}
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
    minHeight: "72px",
    paddingTop: "max(16px, env(safe-area-inset-top))",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    background: "var(--paper-raised)",
    borderBottom: "1px solid var(--line)",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  brandText: {
    minWidth: 0,
  },

  logo: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-sm)",
    background: "var(--oxblood)",
    color: "var(--paper-raised)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontWeight: "800",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: "18px",
    lineHeight: "22px",
    whiteSpace: "nowrap",
  },

  subtitle: {
    margin: 0,
    color: "var(--graphite)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },

  rightSide: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },

  status: {
    color: "var(--graphite)",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  logoutButton: {
    padding: "9px 16px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--line)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    flexShrink: 0,
    transition: "border-color var(--duration-hover) ease, transform var(--duration-hover) var(--ease-out)",
  },
};

export default TopBar;

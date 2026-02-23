import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItem = (path, label, icon) => (
    <Link
      to={path}
      style={{
        ...styles.link,
        color: location.pathname === path ? "#00ff87" : "#aaa",
        background:
          location.pathname === path
            ? "rgba(255,255,255,0.08)"
            : "transparent",
        fontWeight: location.pathname === path ? "bold" : "normal",
      }}
    >
      {icon} {label}
    </Link>
  );

  return (
    <div style={styles.sidebar}>
      <h3 style={{ marginBottom: "30px" }}>Dashboard</h3>

      {menuItem("/", "Overview", "🏠")}
      {menuItem("/meals", "Meals", "🍽")}
      {menuItem("/analytics", "Analytics", "📊")}
      {menuItem("/settings", "Settings", "⚙")}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    background: "#181818",
    padding: "30px 20px",
    borderRight: "1px solid #333",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  link: {
    display: "block",
    marginTop: "12px",
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    textDecoration: "none",
    transition: "0.2s",
  },
};

export default Sidebar;
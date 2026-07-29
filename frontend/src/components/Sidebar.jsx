import { Link, useLocation } from "react-router-dom";
import { BarChart3, LayoutDashboard, Settings, UtensilsCrossed } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: (props) => <LayoutDashboard {...props} /> },
  { path: "/meals", label: "Meals", icon: (props) => <UtensilsCrossed {...props} /> },
  { path: "/analytics", label: "Analytics", icon: (props) => <BarChart3 {...props} /> },
  { path: "/settings", label: "Settings", icon: (props) => <Settings {...props} /> },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.brand}>Dashboard</h3>

      {NAV_ITEMS.map(({ path, label, icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            style={{
              ...styles.link,
              ...(active ? styles.linkActive : {}),
            }}
          >
            {icon({ size: 19, strokeWidth: active ? 2.6 : 2.3 })}
            {label}
          </Link>
        );
      })}
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    background: "var(--paper-raised)",
    padding: "30px 20px",
    borderRight: "1px solid var(--line)",
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    boxSizing: "border-box",
  },

  brand: {
    marginBottom: "30px",
    fontSize: "var(--text-subhead)",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "4px",
    padding: "12px 14px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--graphite)",
    transition: "background var(--duration-hover) ease, color var(--duration-hover) ease",
  },

  linkActive: {
    color: "var(--oxblood)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    fontWeight: "600",
  },
};

export default Sidebar;

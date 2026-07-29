import { Link, useLocation } from "react-router-dom";
import { BarChart3, LayoutDashboard, Settings, UtensilsCrossed } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Overview", icon: (props) => <LayoutDashboard {...props} /> },
  { path: "/meals", label: "Meals", icon: (props) => <UtensilsCrossed {...props} /> },
  { path: "/analytics", label: "Analytics", icon: (props) => <BarChart3 {...props} /> },
  { path: "/settings", label: "Settings", icon: (props) => <Settings {...props} /> },
];

function TabBar() {
  const location = useLocation();

  return (
    <nav style={styles.bar}>
      {NAV_ITEMS.map(({ path, label, icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            style={{
              ...styles.item,
              color: active ? "var(--oxblood)" : "var(--graphite)",
            }}
          >
            {icon({ size: 22, strokeWidth: active ? 2.7 : 2.3 })}
            <span style={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const styles = {
  bar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    background: "var(--paper-raised)",
    borderTop: "1px solid var(--line)",
    padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
    zIndex: 40,
  },

  item: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    textDecoration: "none",
    transition: "color var(--duration-hover) ease",
  },

  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    letterSpacing: "0.04em",
  },
};

export default TabBar;

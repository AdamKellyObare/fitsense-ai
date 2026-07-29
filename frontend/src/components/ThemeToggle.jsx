import { Moon, Sun } from "lucide-react";

function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button onClick={onToggle} style={styles.button}>
      {darkMode ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
      {darkMode ? "Light mode" : "Dark mode"}
    </button>
  );
}

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 16px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--line)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    background: "var(--paper-raised)",
    color: "var(--ink)",
    transition: "border-color var(--duration-hover) ease, transform var(--duration-hover) var(--ease-out)",
  },
};

export default ThemeToggle;

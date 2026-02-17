function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h3>Dashboard</h3>

      <div style={styles.link}>🏠 Overview</div>
      <div style={styles.link}>🍽 Meals</div>
      <div style={styles.link}>📊 Analytics</div>
      <div style={styles.link}>⚙ Settings</div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    background: "#181818",
    padding: "30px 20px",
    borderRight: "1px solid #333",
    minHeight: "100vh",
  },
  link: {
    marginTop: "20px",
    cursor: "pointer",
    color: "#aaa",
  },
};

export default Sidebar;

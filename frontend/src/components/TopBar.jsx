function TopBar() {
  return (
    <div style={styles.topbar}>
      <h2 style={{ margin: 0 }}>FitSense AI</h2>
      <div style={styles.right}>
        <span>🔥 Stay consistent</span>
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    height: "70px",
    background: "#1a1a1a",
    borderBottom: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
  },
  right: {
    color: "#888",
  },
};

export default TopBar;

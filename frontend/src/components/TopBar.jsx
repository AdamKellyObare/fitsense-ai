function TopBar() {
  return (
    <div style={styles.topbar}>
      <div style={styles.inner} ></div>
      <h2>FitSense AI</h2>
      <div style={styles.right}>
        <span>🔥 Stay consistent</span>
      </div>
    </div>
  );
}

const styles = {
  topbar: {
    width: "100%",
    height: "70px",
    background: "#1a1a1a",
    borderBottom: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 30px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  right: {
    color: "#888",
  },
};

export default TopBar;

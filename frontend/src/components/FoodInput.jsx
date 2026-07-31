function FoodInput({ food, setFood, onSubmit, loading }) {
  return (
    <>
      <input
        type="text"
        placeholder="e.g. 3 eggs and toast"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        style={styles.input}
      />

      <button onClick={onSubmit} disabled={loading} style={styles.button}>
        {loading ? "Analyzing meal..." : "Analyze Meal"}
      </button>
    </>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "13px 14px",
    // Kept at >=16px deliberately: iOS auto-zooms the whole page on focus
    // for any text input below that size, and user-scalable=no in
    // index.html isn't reliably honored for that specific behavior on all
    // WebKit versions — the only fully robust fix is the font-size itself.
    fontSize: "16px",
    marginBottom: "15px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "13px",
    fontSize: "15px",
    cursor: "pointer",
    borderRadius: "var(--radius-full)",
    background: "var(--oxblood)",
    color: "#f5efe8",
    border: "none",
    fontWeight: "600",
    transition: "transform var(--duration-hover) var(--ease-out), background var(--duration-hover) ease",
  },
};

export default FoodInput;

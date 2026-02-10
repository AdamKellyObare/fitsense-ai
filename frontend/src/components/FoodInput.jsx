function FoodInput({ food, setFood, onSubmit, loading }) {
  return (
    <>
      <input
        type="text"
        placeholder="e.g. 3 eggs and toast"
        value={food}
        onChange={(e) => setFood(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          marginBottom: "15px",
        }}
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#111",
          color: "#fff",
          border: "none",
        }}
      >
        {loading ? "Analyzing meal..." : "Analyze Meal"}
      </button>
    </>
  );
}

export default FoodInput;

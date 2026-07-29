function MealHistory({ meals, onDelete }) {
  if (!meals.length) return <p>No meals logged yet.</p>;

  return (
    <div style={{ marginTop: "30px", textAlign: "left" }}>
      <h3>Meal History</h3>

      {meals.map((meal, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
            background: "#1c1b1bff"
          }}
        >
          <strong>{meal.food}</strong>
          <p>Goal: {meal.goal}</p>
          <p>{new Date(meal.timestamp).toLocaleString()}</p>

          {meal.analysis && (
          <div style={{ marginTop: "10px" }}>
            <p><strong>Calories:</strong> {meal.calories} kcal</p>
            <p>Protein: {meal.protein}g</p>
            <p>Carbs: {meal.carbs}g</p>
            <p>Fat: {meal.fat}g</p>
          </div>
          )}

          <button
            onClick={() => onDelete(meal.id)}
            style={{
              marginTop: "10px",
              background: "grey",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default MealHistory;

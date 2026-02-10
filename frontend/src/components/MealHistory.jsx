function MealHistory({ meals }) {
  if (!meals.length) return <p>No meals logged yet.</p>;

  return (
    <div style={{ marginTop: "30px", textAlign: "left" }}>
      <h3>Meal History</h3>
      <ul>
        {meals.map((meal, idx) => (
          <li key={idx}>
            {meal.food} ({meal.goal}) - {new Date(meal.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MealHistory;

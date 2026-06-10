import { useState } from "react";

function Meals({ meals, setMeals }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.timestamp).toISOString().split("T")[0];

    const matchesSearch = meal.food
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesDate = selectedDate ? mealDate === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const deleteMeal = (indexToDelete) => {
    const updatedMeals = meals.filter((_, index) => index !== indexToDelete);
    setMeals(updatedMeals);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Meals</h1>
          <p style={styles.subtitle}>Track, search, and manage your logged meals.</p>
        </div>

        <div style={styles.badge}>
          {meals.length} meals logged
        </div>
      </div>

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />

        <button onClick={() => setSelectedDate("")} style={styles.clearButton}>
          Clear
        </button>
      </div>

      {filteredMeals.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>No meals found</h3>
          <p>Log a meal from the Overview page and it will appear here.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredMeals.map((meal, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.food}>{meal.food}</h3>
                <span style={styles.goal}>{meal.goal}</span>
              </div>

              <div style={styles.calories}>{meal.calories} kcal</div>

              <div style={styles.macros}>
                <span>🥩 {meal.protein || 0}g</span>
                <span>🍚 {meal.carbs || 0}g</span>
                <span>🥑 {meal.fat || 0}g</span>
              </div>

              <p style={styles.date}>
                {new Date(meal.timestamp).toLocaleString()}
              </p>

              <button
                onClick={() => deleteMeal(index)}
                style={styles.deleteButton}
              >
                Delete meal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
page: {
  padding: "40px",
  color: "white",
  width: "100%",
  maxWidth: "1100px",
  margin: "0 auto",
  boxSizing: "border-box",
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },

  title: {
    fontSize: "34px",
    margin: 0,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
  },

  badge: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "rgba(0,255,135,0.12)",
    color: "#00ff87",
    fontWeight: "bold",
  },

  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  input: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.07)",
    color: "white",
    outline: "none",
    minWidth: "180px",
  },

  clearButton: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  card: {
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  food: {
    margin: 0,
    fontSize: "20px",
  },

  goal: {
    fontSize: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
    textTransform: "capitalize",
  },

  calories: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#00ff87",
    marginTop: "16px",
  },

  macros: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "18px",
    color: "#cbd5e1",
    flexWrap: "wrap",
    gap: "8px",
  },

  date: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "18px",
  },

  deleteButton: {
    width: "100%",
    padding: "10px",
    marginTop: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  emptyCard: {
    padding: "35px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    color: "#cbd5e1",
  },
};

export default Meals;
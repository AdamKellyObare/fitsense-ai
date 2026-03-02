import { useState } from "react";

function Meals({ meals, setMeals }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.food
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDate = selectedDate
      ? new Date(meal.timestamp).toISOString().split("T")[0] === selectedDate
      : true;

    return matchesSearch && matchesDate;
  });

  const deleteMeal = (id) => {
    const updated = meals.filter((meal) => meal.id !== id);
    setMeals(updated);
    localStorage.setItem("meals", JSON.stringify(updated));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Meals</h2>

      {/* Controls */}
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
      </div>

      {/* Table */}
      {filteredMeals.length === 0 ? (
        <p style={styles.empty}>No meals found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredMeals.map((meal) => (
              <tr key={meal.id}>
                <td>{meal.name}</td>
                <td>{meal.calories}</td>
                <td>{meal.protein}g</td>
                <td>{meal.carbs}g</td>
                <td>{meal.fat}g</td>
                <td>{meal.date}</td>
                <td>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    color: "white",
  },
  title: {
    marginBottom: "20px",
  },
  controls: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#1f2937",
    color: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  deleteBtn: {
    background: "#ef4444",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
  },
  empty: {
    color: "#aaa",
  },
};

export default Meals;
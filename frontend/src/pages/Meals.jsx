import { useState } from "react";
import { motion } from "framer-motion";
import { Beef, Droplets, Pencil, Trash2, Wheat } from "lucide-react";
import { ApiError, mealsApi } from "../lib/api";
import { localDateKey } from "../lib/dates";
import MealPhoto from "../components/MealPhoto";

const MotionDiv = motion.div;

const fadeRiseGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeRiseItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function Meals({ meals, setMeals }) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFood, setEditFood] = useState("");
  const [error, setError] = useState("");

  const filteredMeals = meals.filter((meal) => {
    const mealDate = localDateKey(meal.timestamp);

    const matchesSearch = meal.food
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesDate = selectedDate ? mealDate === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const deleteMeal = async (id) => {
    setError("");
    try {
      await mealsApi.remove(id);
      setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete meal.");
    }
  };

  const startEdit = (meal) => {
    setEditingId(meal.id);
    setEditFood(meal.food);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    setError("");
    try {
      const updatedMeal = await mealsApi.update(id, { food: editFood });
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === id ? { ...updatedMeal, timestamp: updatedMeal.created_at } : meal
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update meal.");
    }
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

      {error && <div style={styles.error}>{error}</div>}

      {filteredMeals.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>No meals found</h3>
          <p>Log a meal from the Overview page and it will appear here.</p>
        </div>
      ) : (
        <MotionDiv style={styles.grid} variants={fadeRiseGroup} initial="hidden" animate="visible">
          {filteredMeals.map((meal) =>
            editingId === meal.id ? (
              <MotionDiv key={meal.id} variants={fadeRiseItem} style={styles.card}>
                <input
                  type="text"
                  value={editFood}
                  onChange={(e) => setEditFood(e.target.value)}
                  style={styles.input}
                />

                <div style={styles.editActions}>
                  <button onClick={() => saveEdit(meal.id)} style={styles.saveButton}>
                    Save
                  </button>
                  <button onClick={cancelEdit} style={styles.clearButton}>
                    Cancel
                  </button>
                </div>
              </MotionDiv>
            ) : (
              <MotionDiv
                key={meal.id}
                variants={fadeRiseItem}
                style={styles.card}
                whileHover={{ y: -3, boxShadow: "var(--shadow-lg)" }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <MealPhoto meal={meal} style={styles.photo} />

                <div style={styles.cardBody}>
                  <h3 style={styles.food}>{meal.food}</h3>

                  <div style={styles.calories}>
                    {meal.calories} <span style={styles.caloriesUnit}>kcal</span>
                  </div>

                  <div style={styles.macros}>
                    <span style={styles.macroItem}><Beef size={14} strokeWidth={2.4} /> {meal.protein || 0}g</span>
                    <span style={styles.macroItem}><Wheat size={14} strokeWidth={2.4} /> {meal.carbs || 0}g</span>
                    <span style={styles.macroItem}><Droplets size={14} strokeWidth={2.4} /> {meal.fat || 0}g</span>
                  </div>

                  <p style={styles.meta}>
                    {meal.goal} · {new Date(meal.timestamp).toLocaleString()}
                  </p>

                  <div style={styles.cardActions}>
                    <button onClick={() => startEdit(meal)} style={styles.editButton}>
                      <Pencil size={15} strokeWidth={2.4} /> Edit
                    </button>
                    <button onClick={() => deleteMeal(meal.id)} style={styles.deleteButton}>
                      <Trash2 size={15} strokeWidth={2.4} /> Delete
                    </button>
                  </div>
                </div>
              </MotionDiv>
            )
          )}
        </MotionDiv>
      )}
    </div>
  );
}

const styles = {
page: {
  padding: "40px",
  color: "var(--ink)",
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
    fontSize: "32px",
    margin: 0,
  },

  subtitle: {
    color: "var(--graphite)",
    marginTop: "8px",
    fontSize: "14px",
  },

  badge: {
    padding: "9px 14px",
    borderRadius: "var(--radius-full)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    color: "var(--oxblood)",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    fontWeight: "600",
  },

  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  input: {
    padding: "12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper-raised)",
    color: "var(--ink)",
    outline: "none",
    minWidth: "180px",
    fontFamily: "var(--font-body)",
    // >=16px: iOS auto-zooms the page on focus below that, regardless of
    // user-scalable=no (unreliable for this specific behavior on WebKit).
    fontSize: "16px",
  },

  clearButton: {
    padding: "12px 18px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper-raised)",
    color: "var(--ink)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  card: {
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
    overflow: "hidden",
  },

  photo: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },

  cardBody: {
    padding: "18px",
  },

  food: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "600",
  },

  calories: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "26px",
    color: "var(--ink)",
    marginTop: "12px",
  },

  caloriesUnit: {
    fontFamily: "var(--font-mono)",
    fontWeight: "500",
    fontSize: "13px",
    color: "var(--graphite)",
  },

  macros: {
    display: "flex",
    gap: "14px",
    marginTop: "12px",
    flexWrap: "wrap",
  },

  macroItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
  },

  meta: {
    color: "var(--graphite)",
    fontSize: "12px",
    marginTop: "14px",
    textTransform: "capitalize",
  },

  deleteButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--line)",
    background: "transparent",
    color: "var(--oxblood)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  editButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--line)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },

  editActions: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
    padding: "0 18px 18px",
  },

  saveButton: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--oxblood)",
    color: "#f5efe8",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    color: "var(--oxblood)",
  },

  emptyCard: {
    padding: "35px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    textAlign: "center",
    color: "var(--graphite)",
  },
};

export default Meals;

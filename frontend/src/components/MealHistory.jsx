import { Beef, Droplets, Trash2, Wheat } from "lucide-react";
import { isToday } from "../lib/dates";
import MealPhoto from "./MealPhoto";

function MealCard({ meal, onDelete }) {
  return (
    <div style={styles.card}>
      <MealPhoto meal={meal} style={styles.photo} />

      <div style={styles.body}>
        <div style={styles.topRow}>
          <strong style={styles.food}>{meal.food}</strong>
          <span style={styles.calories}>{meal.calories} kcal</span>
        </div>

        <div style={styles.macros}>
          <span style={styles.macroItem}><Beef size={14} strokeWidth={2.4} /> {meal.protein || 0}g</span>
          <span style={styles.macroItem}><Wheat size={14} strokeWidth={2.4} /> {meal.carbs || 0}g</span>
          <span style={styles.macroItem}><Droplets size={14} strokeWidth={2.4} /> {meal.fat || 0}g</span>
        </div>

        <p style={styles.meta}>
          {meal.goal} · {new Date(meal.timestamp).toLocaleString()}
        </p>
      </div>

      <button onClick={() => onDelete(meal.id)} style={styles.deleteButton} aria-label="Delete meal">
        <Trash2 size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function MealHistory({ meals, onDelete }) {
  if (!meals.length) return <p style={styles.empty}>No meals logged yet.</p>;

  // Meals arrive newest-first from the API — filtering preserves that order
  // within each group, so no separate sort is needed here.
  const todays = meals.filter((meal) => isToday(meal.timestamp));
  const earlier = meals.filter((meal) => !isToday(meal.timestamp));

  return (
    <div style={{ marginTop: "30px" }}>
      {todays.length > 0 && (
        <>
          <h3 style={styles.heading}>Today</h3>
          {todays.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
          ))}
        </>
      )}

      {earlier.length > 0 && (
        <>
          <h3 style={styles.heading}>Earlier</h3>
          {earlier.map((meal) => (
            <MealCard key={meal.id} meal={meal} onDelete={onDelete} />
          ))}
        </>
      )}
    </div>
  );
}

const styles = {
  heading: {
    marginTop: "24px",
    marginBottom: "12px",
    fontSize: "18px",
  },

  empty: {
    color: "var(--graphite)",
    fontSize: "14px",
  },

  card: {
    display: "flex",
    alignItems: "stretch",
    gap: "12px",
    borderRadius: "var(--radius-md)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    padding: "10px",
    marginBottom: "12px",
  },

  photo: {
    width: "64px",
    height: "64px",
    borderRadius: "var(--radius-sm)",
    objectFit: "cover",
    flexShrink: 0,
  },

  body: {
    flex: 1,
    minWidth: 0,
    textAlign: "left",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "10px",
  },

  food: {
    fontSize: "14px",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  calories: {
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: "13px",
    color: "var(--ink)",
    flexShrink: 0,
  },

  macros: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
  },

  macroItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--graphite)",
  },

  meta: {
    color: "var(--graphite)",
    fontSize: "11px",
    marginTop: "6px",
    textTransform: "capitalize",
  },

  deleteButton: {
    alignSelf: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid var(--line)",
    background: "transparent",
    color: "var(--graphite)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export default MealHistory;

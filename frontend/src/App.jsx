import { useState, useEffect } from "react";
import FoodInput from "./components/FoodInput";
import GoalSelector from "./components/GoalSelector";
import MealHistory from "./components/MealHistory";

function App() {
  const [food, setFood] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Load meals from localStorage safely
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem("fitsense_meals");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // ✅ Save meals to localStorage whenever meals change
  useEffect(() => {
    localStorage.setItem("fitsense_meals", JSON.stringify(meals));
  }, [meals]);

  // ✅ Analyze meal
  const estimateCalories = async () => {
    if (!food) return;

    setLoading(true);
    setError("");
    setResult("");

    // Base calories (mock AI for now)
    const baseCalories = Math.floor(Math.random() * 500) + 200;

    // Adjust based on goal
    let adjustedCalories = baseCalories;

    if (goal === "cutting") {
      adjustedCalories = Math.round(baseCalories * 0.85);
    } else if (goal === "bulking") {
      adjustedCalories = Math.round(baseCalories * 1.15);
    }

    const newMeal = {
      food,
      goal,
      calories: adjustedCalories,
      timestamp: new Date().toISOString(),
    };

    // Update meals state ONCE
    setMeals(prevMeals => [...prevMeals, newMeal]);

    // Show result
    setResult(
      `Estimated calories for ${food}: ${adjustedCalories} kcal (${goal})`
    );

    setLoading(false);
  };

  // ✅ Calculate today's calories
  const today = new Date().toDateString();

  const todaysMeals = meals.filter(
    meal => new Date(meal.timestamp).toDateString() === today
  );

  const totalCaloriesToday = todaysMeals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0
  );

  // ✅ Delete meal
  const deleteMeal = (indexToDelete) => {
    setMeals(prevMeals =>
      prevMeals.filter((_, index) => index !== indexToDelete)
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FitSense AI</h1>
      <p style={styles.subtitle}>
        Smart calorie insights based on your fitness goal
      </p>

      <div style={styles.totalBox}>
        🔥 Today’s Total: {totalCaloriesToday} kcal
      </div>

      <GoalSelector goal={goal} setGoal={setGoal} />

      <FoodInput
        food={food}
        setFood={setFood}
        onSubmit={estimateCalories}
        loading={loading}
      />

      {result && <div style={styles.result}>{result}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <MealHistory meals={meals} onDelete={deleteMeal} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "80px auto",
    padding: "30px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "36px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },
  totalBox: {
    marginBottom: "20px",
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: "8px",
  },
  result: {
    marginTop: "25px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  error: {
    marginTop: "20px",
    color: "red",
  },
};

export default App;

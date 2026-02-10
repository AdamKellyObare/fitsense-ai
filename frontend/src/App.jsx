import { useState } from "react";
import FoodInput from "./components/FoodInput";
import GoalSelector from "./components/GoalSelector";
import MealHistory from "./components/MealHistory";

function App() {
  const [food, setFood] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState([]);

  const estimateCalories = async () => {
    if (!food) return;

    setLoading(true);
    setError("");
    setResult("");

    // Create new meal and update state
    const newMeal = {
      food,
      goal,
      timestamp: new Date().toISOString(),
    };
    setMeals([newMeal, ...meals]); // prepend so newest meal appears on top

    try {
      // MOCK AI calories
      const mockCalories = Math.floor(Math.random() * 500) + 100;
      setResult(`Estimated calories for ${food}: ${mockCalories} kcal`);

      // REAL backend call (optional)
      /*
      const response = await fetch(
        `http://127.0.0.1:8000/estimate-calories/?food=${encodeURIComponent(
          food
        )}&goal=${goal}`
      );
      const data = await response.json();
      setResult(data.message);
      */
    } catch (err) {
      setError("AI is currently unavailable. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>FitSense AI</h1>
      <p style={styles.subtitle}>
        Smart calorie insights based on your fitness goal
      </p>

      <GoalSelector goal={goal} setGoal={setGoal} />
      <FoodInput
        food={food}
        setFood={setFood}
        onSubmit={estimateCalories}
        loading={loading}
      />

      {result && <div style={styles.result}>{result}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Render meal history */}
      <MealHistory meals={meals} />
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
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
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

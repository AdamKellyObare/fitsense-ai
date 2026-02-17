import { useState, useEffect } from "react";
import FoodInput from "./components/FoodInput";
import GoalSelector from "./components/GoalSelector";
import MealHistory from "./components/MealHistory";
import WeeklySummary from "./components/WeeklySummary";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

function App() {
  const [food, setFood] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load daily goal from localStorage
  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("fitsense_daily_goal");
    return savedGoal ? Number(savedGoal) : 2000;
  });

  // Load meals safely
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

  // Save meals
  useEffect(() => {
    localStorage.setItem("fitsense_meals", JSON.stringify(meals));
  }, [meals]);

  // Save daily goal
  useEffect(() => {
    localStorage.setItem("fitsense_daily_goal", dailyGoal);
  }, [dailyGoal]);

  // Analyze meal
  const estimateCalories = async () => {
    if (!food) return;

    setLoading(true);
    setError("");
    setResult("");

    const baseCalories = Math.floor(Math.random() * 500) + 200;

    let adjustedCalories = baseCalories;

    if (goal === "cutting") {
      adjustedCalories = Math.round(baseCalories * 0.85);
    } else if (goal === "bulking") {
      adjustedCalories = Math.round(baseCalories * 1.15);
    }

    // mock macros
    const protein = Math.floor(Math.random() * 40) + 10;
    const carbs = Math.floor(Math.random() * 60) + 20;
    const fat = Math.floor(Math.random() * 25) + 5;

    const newMeal = {
      food,
      goal,
      calories: adjustedCalories,
      protein,
      carbs,
      fat,
      timestamp: new Date().toISOString(),
    };

    setMeals(prevMeals => [...prevMeals, newMeal]);

    setResult(
      `Estimated calories for ${food}: ${adjustedCalories} kcal (${goal})`
    );

    setLoading(false);
  };

  // Today's calculations
  const today = new Date().toDateString();

  const todaysMeals = meals.filter(
    meal => new Date(meal.timestamp).toDateString() === today
  );

  const totalCaloriesToday = todaysMeals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0
  );

  const totalProteinToday = todaysMeals.reduce(
    (sum, meal) => sum + (meal.protein || 0),
    0
  );

  const totalCarbsToday = todaysMeals.reduce(
    (sum, meal) => sum + (meal.carbs || 0),
    0
  );

  const totalFatToday = todaysMeals.reduce(
    (sum, meal) => sum + (meal.fat || 0),
    0
  );

  const numericGoal = Number(dailyGoal);

  const progressPercent =
    numericGoal > 0
      ? Math.min((totalCaloriesToday / numericGoal) * 100, 100)
      : 0;

  // Delete meal
  const deleteMeal = (indexToDelete) => {
    setMeals(prevMeals =>
      prevMeals.filter((_, index) => index !== indexToDelete)
    );
  };

return (
  <div style={styles.page}>
      <div style={styles.appLayout}>
    
    <Sidebar />

    <div style={styles.mainArea}>
      <TopBar />

      <div style={styles.page}>
        
        <div style={styles.leftPanel}>
          <WeeklySummary meals={meals} />
        </div>

        <div style={styles.container}></div>


    
    {/* LEFT — Weekly Chart */}
    <div style={styles.leftPanel}>
      <WeeklySummary meals={meals} />
    </div>

    {/* RIGHT — Main App */}
    <div style={styles.container}>
      <h1 style={styles.title}>FitSense AI</h1>
      <p style={styles.subtitle}>
        Smart calorie insights based on your fitness goal
      </p>

      <div style={styles.macroBox}>
        <p>🥩 Protein: {totalProteinToday} g</p>
        <p>🍚 Carbs: {totalCarbsToday} g</p>
        <p>🥑 Fat: {totalFatToday} g</p>
      </div>

      <div style={styles.totalBox}>
        🔥 Today’s Total: {totalCaloriesToday} / {numericGoal || 0} kcal

        <div style={{ marginTop: "10px" }}>
          <input
            type="number"
            min="0"
            value={dailyGoal}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") return setDailyGoal("");
              if (Number(value) >= 0) setDailyGoal(value);
            }}
            style={styles.goalInput}
          />
        </div>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`
            }}
          />
        </div>
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

  </div>
          </div>

      </div>
    </div>

//   </div>
// );

);

}

const styles = {
  /* FULL SCREEN PAGE */
  page: {
    display: "flex",
    width: "100vw",
    minHeight: "100vh",
    background: "#1b1b1bff",
    color: "white",
    flexWrap: "wrap",
  },

  appLayout: {
  display: "flex",
},

mainArea: {
  flex: 1,
},


  /* LEFT SIDE (CHART) */
  leftPanel: {
    flex: "1 1 40%",
    padding: "40px",
    minWidth: "300px",
  },

  /* RIGHT SIDE (APP) */
  container: {
    flex: "1 1 60%",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },



  progressBar: {
    height: "10px",
    background: "#4e3f3f",
    borderRadius: "10px",
    marginTop: "10px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#00ff5e",
    transition: "0.3s",
  },

  macroBox: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#202020",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "500px",
  },

  title: {
    fontSize: "36px",
    marginBottom: "10px",
    textAlign: "center",
  },

  subtitle: {
    color: "#666",
    marginBottom: "25px",
    textAlign: "center",
  },

  totalBox: {
    marginBottom: "20px",
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "500px",
  },

  goalInput: {
    width: "100%",
    padding: "8px",
    marginTop: "8px",
    borderRadius: "6px",
    border: "none",
    boxSizing: "border-box",
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

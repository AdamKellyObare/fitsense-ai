import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { ApiError, mealsApi } from "./lib/api";

import FoodInput from "./components/FoodInput";
import GoalSelector from "./components/GoalSelector";
import MealHistory from "./components/MealHistory";
import WeeklySummary from "./components/WeeklySummary";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatCard from "./components/StatCard";
import ThemeToggle from "./components/ThemeToggle";

import Meals from "./pages/Meals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const { user, loading: authLoading, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [food, setFood] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("fitsense_theme");
    return saved ? JSON.parse(saved) : true;
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("fitsense_daily_goal");
    return savedGoal ? Number(savedGoal) : 2000;
  });

  const [water, setWater] = useState(() => {
    return Number(localStorage.getItem("fitsense_water") || 0);
  });

  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    mealsApi
      .list()
      .then((fetchedMeals) =>
        setMeals(fetchedMeals.map((meal) => ({ ...meal, timestamp: meal.created_at })))
      )
      .catch(() => setMeals([]));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("fitsense_theme", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("fitsense_daily_goal", dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("fitsense_water", water);
  }, [water]);

  const estimateCalories = async () => {
    if (!food) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const newMeal = await mealsApi.create(food, goal);
      setMeals((prevMeals) => [
        ...prevMeals,
        { ...newMeal, timestamp: newMeal.created_at },
      ]);
      setResult(`Estimated calories for ${food}: ${newMeal.calories} kcal (${goal})`);
      setFood("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to analyze meal.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();

  const todaysMeals = meals.filter(
    (meal) => new Date(meal.timestamp).toDateString() === today
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
    numericGoal > 0 ? Math.min((totalCaloriesToday / numericGoal) * 100, 100) : 0;

  const caloriesRemaining =
    numericGoal - totalCaloriesToday > 0 ? numericGoal - totalCaloriesToday : 0;

  const deleteMeal = (indexToDelete) => {
    setMeals((prevMeals) =>
      prevMeals.filter((_, index) => index !== indexToDelete)
    );
  };

  const styles = getStyles(darkMode, isMobile);

  if (authLoading) {
    return <div style={styles.authLoading}>Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div style={styles.page}>
      {(!isMobile || sidebarOpen) && (
        <div style={styles.sidebarWrapper}>
          <Sidebar />
        </div>
      )}

      <div style={styles.mainArea}>
        <div style={styles.topBarWrapper}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              ☰
            </button>
          )}

          <TopBar userEmail={user.email} onLogout={logout} />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div style={styles.contentArea}>
                <div style={styles.dashboardWrapper}>
                  <div style={{ ...styles.dashboard, ...styles.mobileStack }}>
                    <div style={styles.leftPanel}>
                      <WeeklySummary meals={meals} />
                    </div>

                    <div style={styles.container}>
                      <h1 style={styles.title}>FitSense AI</h1>

                      <div style={{ marginBottom: "20px" }}>
                        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                      </div>

                      <p style={styles.subtitle}>
                        Smart calorie insights based on your fitness goal
                      </p>

                      <div style={styles.statsRow}>
                        <StatCard label="Calories" value={totalCaloriesToday} unit="kcal" icon="🔥" color="#00ff87" />
                        <StatCard label="Protein" value={totalProteinToday} unit="g" icon="🥩" color="#60efff" />
                        <StatCard label="Carbs" value={totalCarbsToday} unit="g" icon="🍚" color="#facc15" />
                        <StatCard label="Fat" value={totalFatToday} unit="g" icon="🥑" color="#fb7185" />
                        <StatCard label="Water" value={water} unit="L" icon="💧" color="#38bdf8" />
                      </div>

                      <div style={styles.waterButtons}>
                        <button onClick={() => setWater(water + 0.25)} style={styles.smallButton}>
                          +250ml
                        </button>

                        <button onClick={() => setWater(water + 0.5)} style={styles.smallButton}>
                          +500ml
                        </button>

                        <button onClick={() => setWater(0)} style={styles.resetWaterButton}>
                          Reset Water
                        </button>
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
                              width: `${progressPercent}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div style={styles.aiCoach}>
                        <h3>🤖 AI Coach</h3>
                        <p>
                          You're <strong>{caloriesRemaining} kcal</strong> away from today's goal.
                        </p>
                        <p>
                          Protein consumed today: <strong>{totalProteinToday}g</strong>
                        </p>
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
            }
          />

          <Route path="/meals" element={<Meals meals={meals} setMeals={setMeals} />} />
          <Route path="/analytics" element={<Analytics meals={meals} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

const getStyles = (darkMode, isMobile) => ({
  authLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },

  page: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    width: "100vw",
    minHeight: "100vh",
    background: darkMode ? "#0f172a" : "#f3f4f6",
    color: darkMode ? "white" : "#111",
    overflow: "hidden",
  },

  sidebarWrapper: {
    width: isMobile ? "100%" : "240px",
    flexShrink: 0,
    borderRight: darkMode
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.08)",
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    paddingLeft: 0,
    minWidth: 0,
  },

  topBarWrapper: {
    width: "100%",
    height: "72px",
    minHeight: "72px",
    display: "flex",
    alignItems: "center",
    padding: 0,
    margin: 0,
    background: darkMode ? "rgba(18,18,18,0.95)" : "rgba(255,255,255,0.95)",
    borderBottom: darkMode
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },

  menuButton: {
    fontSize: "22px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer",
    marginLeft: "12px",
  },

  contentArea: {
    flex: 1,
    overflowY: "auto",
    padding: "40px 30px",
  },

  dashboardWrapper: {
    width: "93%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
    background: darkMode ? "rgba(20,20,35,0.55)" : "rgba(255,255,255,0.55)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: "20px",
    border: darkMode
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(255,255,255,0.4)",
  },

  dashboard: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "24px",
    alignItems: "stretch",
  },

  mobileStack: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "24px",
  },

  leftPanel: {
    padding: "25px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  container: {
    padding: "30px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    maxWidth: "560px",
    margin: "0 auto",
  },

  title: {
    fontSize: "36px",
    marginBottom: "8px",
  },

  subtitle: {
    color: darkMode ? "#94a3b8" : "#555",
    marginBottom: "30px",
  },

  statsRow: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  waterButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  smallButton: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#334155",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  resetWaterButton: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  totalBox: {
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontWeight: "bold",
  },

  goalInput: {
    width: "95%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    outline: "none",
  },

  progressBar: {
    height: "12px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    marginTop: "12px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00ff87, #60efff)",
    transition: "0.4s ease",
  },

  aiCoach: {
    textAlign: "left",
    background: "rgba(255,255,255,0.07)",
    padding: "20px",
    borderRadius: "14px",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
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
});

export default App;

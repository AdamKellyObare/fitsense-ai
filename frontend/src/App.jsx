import { useState, useEffect } from "react";
import FoodInput from "./components/FoodInput";
import GoalSelector from "./components/GoalSelector";
import MealHistory from "./components/MealHistory";
import WeeklySummary from "./components/WeeklySummary";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import StatCard from "./components/StatCard";
import ThemeToggle from "./components/ThemeToggle";
import { Routes, Route } from "react-router-dom";
import Meals from "./pages/Meals";

// Temporary pages (we'll design later)
function Overview() {
  return <div>Overview Page</div>;
}

function Analytics() {
  return <div>Analytics Page</div>;
}

function Settings() {
  return <div>Settings Page</div>;
}

function App() {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [food, setFood] = useState("");
  const [goal, setGoal] = useState("maintenance");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Theme mode
const [darkMode, setDarkMode] = useState(() => {
  const saved = localStorage.getItem("fitsense_theme");
  return saved ? JSON.parse(saved) : true;
});



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

  // Save theme preference
useEffect(() => {
  localStorage.setItem("fitsense_theme", JSON.stringify(darkMode));
}, [darkMode]);


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
const styles = getStyles(darkMode, isMobile);

if (!authenticated) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#0f172a",
      color: "white",
      flexDirection: "column",
      fontFamily: "Arial"
    }}>
      <h2>FitSense AI Preview</h2>

      <input
        type="password"
        placeholder="Enter password"
        value={passwordInput}
        onChange={(e) => setPasswordInput(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          marginTop: "15px",
          border: "none"
        }}
      />

      <button
        onClick={() => {
          if (passwordInput === "1234") {
            setAuthenticated(true);
          } else {
            alert("Wrong password");
          }
        }}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Login
      </button>
    </div>
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
<TopBar />
</div>

<Routes>

  {/* DASHBOARD PAGE */}
  <Route
    path="/"
    element={
      <div style={styles.contentArea}>
        <div style={styles.dashboardWrapper}>
          <div style={{ ...styles.dashboard, ...styles.mobileStack }}>

            {/* LEFT — Chart */}
            <div style={styles.leftPanel}>
              <WeeklySummary meals={meals} />
            </div>

            {/* RIGHT — Main App */}
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
    }
  />

<Route
  path="/meals"
  element={<Meals meals={meals} setMeals={setMeals} />}
/>  <Route path="/analytics" element={<Analytics />} />
  <Route path="/settings" element={<Settings />} />

</Routes>
  </div>
  </div>

);


}


const getStyles = (darkMode, isMobile) => ({
  /* FULL SCREEN PAGE */
page: {
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  width: "100%",
  minHeight: "100vh",
  background: darkMode ? "#0f172a" : "#f3f4f6",
  color: darkMode ? "white" : "#111",
  transition: "0.3s",
  overflow: "hidden",
},



appContainer: {
  minHeight: "100vh",
  padding: "30px",
  background: darkMode
    ? "linear-gradient(135deg,#0f172a,#1e293b)"
    : "linear-gradient(135deg,#dbeafe,#f0f9ff)"
},

sidebar: {
  width: isMobile ? "100%" : "250px",
  height: isMobile ? "auto" : "100vh",
},


statsRow: {
  display: "flex",
  gap: "15px",
  marginTop: "20px",
  marginBottom: "20px",
  flexWrap: "wrap",
},

content: {
  maxWidth: "1200px",
  margin: "40px auto",
  width: "100%",
  padding: "0 20px"
},


glassCard: {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
},


  topPanel: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
  },
  appLayout: {
  display: "flex",
},

mainArea: {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  paddingLeft: "60px",
},

contentArea: {
  flex: 1,
  overflowY: "auto",
  padding: "40px 30px",
},

card: {
  background: "#242424",
  borderRadius: "12px",
  padding: "18px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
},


dashboard: {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  gap: "24px",
  alignItems: "stretch",
},



topBarWrapper: {
  height: "70px",
  minHeight: "70px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "0 30px",

  borderBottom: darkMode
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.08)",

  background: darkMode
    ? "rgba(15,23,42,0.75)"
    : "rgba(255,255,255,0.75)",

  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",

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
},



mobileStack: {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  gap: "24px",
},

  /* LEFT SIDE (CHART) */
leftPanel: {
  padding: "25px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
},



  /* RIGHT SIDE (APP) */
container: {
  padding: "30px",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
  borderRadius: "20px", // will change this later on for a better look
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  maxWidth: "520px",
  margin: "0 auto",
},



sidebarWrapper: {
  width: isMobile ? "100%" : "220px",
  flexShrink: 0,
  borderRight: darkMode
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.08)",
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

macroBox: {
  marginTop: "15px",
  padding: "18px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
},

dashboardWrapper: {
  width: "93%",
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  flexWrap: "wrap",
  gap: "25px",
  padding: "30px",
  alignItems: "stretch",
  justifyContent: "center",

  background: darkMode
    ? "rgba(20,20,35,0.55)"
    : "rgba(255,255,255,0.55)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  borderRadius: "20px",
  border: darkMode
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(255,255,255,0.4)",
},
  
title: {
  fontSize: "36px",
  marginBottom: "8px",
  letterSpacing: "0.5px",
},



subtitle: {
  color: darkMode ? "#94a3b8" : "#555",
  marginBottom: "30px",
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

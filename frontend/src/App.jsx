import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

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

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("fitsense_meals", JSON.stringify(meals));
  }, [meals]);

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

    const baseCalories = Math.floor(Math.random() * 500) + 200;

    let adjustedCalories = baseCalories;

    if (goal === "cutting") {
      adjustedCalories = Math.round(baseCalories * 0.85);
    } else if (goal === "bulking") {
      adjustedCalories = Math.round(baseCalories * 1.15);
    }

    const protein = Math.floor(Math.random() * 40) + 10;
    const carbs = Math.floor(Math.random() * 60) + 20;
    const fat = Math.floor(Math.random() * 25) + 5;

    const newMeal = {
      id: Date.now(),
      food,
      goal,
      calories: adjustedCalories,
      protein,
      carbs,
      fat,
      timestamp: new Date().toISOString(),
    };

    setMeals((prevMeals) => [...prevMeals, newMeal]);

    setResult(
      `Estimated calories for ${food}: ${adjustedCalories} kcal (${goal})`
    );

    setFood("");
    setLoading(false);
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
    numericGoal > 0
      ? Math.min((totalCaloriesToday / numericGoal) * 100, 100)
      : 0;

  const caloriesRemaining =
    numericGoal - totalCaloriesToday > 0 ? numericGoal - totalCaloriesToday : 0;

  const deleteMeal = (indexToDelete) => {
    setMeals((prevMeals) =>
      prevMeals.filter((_, index) => index !== indexToDelete)
    );
  };

  const styles = getStyles(darkMode, isMobile);

if (!authenticated) {
  return (
    <div style={styles.loginPage}>
      <div style={styles.loginNav}>
        <div style={styles.loginBrand}>
          <div style={styles.loginBrandIcon}>F</div>
          <span>FitSense AI</span>
        </div>

        <div style={styles.loginNavLinks}>
          <span>Preview</span>
          <span>Features</span>
          <span>AI Coach</span>
        </div>
      </div>

      <div style={styles.loginHero}>
        <div style={styles.loginLeft}>
          <div style={styles.loginBadge}>⭐ Lead tester preview access</div>

          <h1 style={styles.loginHeroTitle}>
            Track your calories smarter with FitSense AI
          </h1>

          <p style={styles.loginHeroText}>
            Log meals, monitor macros, track water, view analytics, and get
            AI-powered nutrition insights from one clean dashboard.
          </p>

          <div style={styles.trustStats}>
            <span>🔥 Meal tracking</span>
            <span>🥩 Macro insights</span>
            <span>🤖 AI coach</span>
          </div>

          <div style={styles.loginAccessBox}>
            <label style={styles.loginLabel}>Tester password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && passwordInput === "1234") {
                  setAuthenticated(true);
                }
              }}
              style={styles.loginInput}
            />

            <button
              onClick={() => {
                if (passwordInput === "1234") {
                  setAuthenticated(true);
                } else {
                  alert("Wrong password");
                }
              }}
              style={styles.loginButton}
            >
              Enter Dashboard
            </button>

            <div style={styles.testerBox}>
              <div style={styles.testerTitle}>🧪 Demo Account Access</div>
              <div style={styles.testerPassword}>
                Tester Access Password: <strong>1234</strong>
              </div>
            </div>
          </div>
        </div>

<div style={styles.loginRight}>
  <div style={styles.phoneFrame}>
    <div style={styles.phoneScreen}>
      <div style={styles.phoneStatusBar}>
        <span style={styles.phoneTime}>9:41</span>

        <div style={styles.dynamicIsland}></div>

        <div style={styles.iosIcons}>
          <span style={styles.cellularIcon}>
            <span style={{ width: "3px", height: "4px", background: "white", borderRadius: "2px" }}></span>
            <span style={{ width: "3px", height: "6px", background: "white", borderRadius: "2px" }}></span>
            <span style={{ width: "3px", height: "8px", background: "white", borderRadius: "2px" }}></span>
            <span style={{ width: "3px", height: "10px", background: "white", borderRadius: "2px" }}></span>
          </span>

          <span style={styles.wifiSvg}>⌁</span>

          <span style={styles.batteryOuter}>
            <span style={styles.batteryInner}></span>
            <span style={styles.batteryCap}></span>
          </span>
        </div>
      </div>

      <div style={styles.phoneHeader}>
        <button style={styles.iconCircle}>←</button>
        <span style={styles.phoneTitle}>Scanner</span>
        <button style={styles.iconCircle}>•••</button>
      </div>

      <div style={styles.scanCard}>
        <div style={styles.scanFrame}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=90"
            alt="Healthy meal"
            style={styles.mealImage}
          />

          <div style={styles.scanOverlay}></div>

          <div style={styles.scanCornerTopLeft}></div>
          <div style={styles.scanCornerTopRight}></div>
          <div style={styles.scanCornerBottomLeft}></div>
          <div style={styles.scanCornerBottomRight}></div>

          <div style={styles.foodLabelOne}>Chicken bowl · 520</div>
          <div style={styles.foodLabelTwo}>Protein 35g</div>
          {/* <div style={styles.foodLabelThree}>Avocado · 90</div> */}
          <div style={styles.foodLabelFour}>Vegetables · 90</div>
        </div>

        <p style={styles.scanText}>AI meal scan preview</p>
      </div>

      <div style={styles.previewStats}>
        <div style={styles.previewStat}>
          <span>🔥 Calories</span>
          <strong>520 kcal</strong>
        </div>

        <div style={styles.previewStat}>
          <span>🥩 Protein</span>
          <strong>35g</strong>
        </div>

        <div style={styles.previewStat}>
          <span>💧 Water</span>
          <strong>1.5L</strong>
        </div>

        <div style={styles.previewStat}>
          <span>🎯 Goal</span>
          <strong>76%</strong>
        </div>
      </div>

      <div style={styles.aiPreview}>
        <strong>🤖 AI Coach</strong>
        <p>You are 480 kcal away from today’s goal.</p>
      </div>

      <div style={styles.homeIndicator}></div>
    </div>
  </div>
</div>
      </div>
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
                        <ThemeToggle
                          darkMode={darkMode}
                          setDarkMode={setDarkMode}
                        />
                      </div>

                      <p style={styles.subtitle}>
                        Smart calorie insights based on your fitness goal
                      </p>

                      <div style={styles.statsRow}>
                        <StatCard
                          label="Calories"
                          value={totalCaloriesToday}
                          unit="kcal"
                          icon="🔥"
                          color="#00ff87"
                        />

                        <StatCard
                          label="Protein"
                          value={totalProteinToday}
                          unit="g"
                          icon="🥩"
                          color="#60efff"
                        />

                        <StatCard
                          label="Carbs"
                          value={totalCarbsToday}
                          unit="g"
                          icon="🍚"
                          color="#facc15"
                        />

                        <StatCard
                          label="Fat"
                          value={totalFatToday}
                          unit="g"
                          icon="🥑"
                          color="#fb7185"
                        />

                        <StatCard
                          label="Water"
                          value={water}
                          unit="L"
                          icon="💧"
                          color="#38bdf8"
                        />
                      </div>

                      <div style={styles.waterButtons}>
                        <button
                          onClick={() => setWater(water + 0.25)}
                          style={styles.smallButton}
                        >
                          +250ml
                        </button>

                        <button
                          onClick={() => setWater(water + 0.5)}
                          style={styles.smallButton}
                        >
                          +500ml
                        </button>

                        <button
                          onClick={() => setWater(0)}
                          style={styles.resetWaterButton}
                        >
                          Reset Water
                        </button>
                      </div>

                      <div style={styles.totalBox}>
                        🔥 Today’s Total: {totalCaloriesToday} /{" "}
                        {numericGoal || 0} kcal

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
                          You're <strong>{caloriesRemaining} kcal</strong> away
                          from today's goal.
                        </p>
                        <p>
                          Protein consumed today:{" "}
                          <strong>{totalProteinToday}g</strong>
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

          <Route
            path="/meals"
            element={<Meals meals={meals} setMeals={setMeals} />}
          />

          <Route path="/analytics" element={<Analytics meals={meals} />} />

          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

const getStyles = (darkMode, isMobile) => ({
  page: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    width: "100vw",
    minHeight: "100vh",
    background: darkMode ? "#0f172a" : "#f3f4f6",
    color: darkMode ? "white" : "#111",
    transition: "0.3s",
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
    background: darkMode
      ? "rgba(18,18,18,0.95)"
      : "rgba(255,255,255,0.95)",
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
    letterSpacing: "0.5px",
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

loginPage: {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 35%), linear-gradient(135deg, #020617, #0f172a)",
  color: "white",
  fontFamily: "Arial, sans-serif",
  overflow: "auto",
  boxSizing: "border-box",
},

loginNav: {
  width: "100%",
  maxWidth: "1250px",
  margin: "0 auto",
  padding: "28px 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxSizing: "border-box",
},

loginBrand: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "24px",
  fontWeight: "900",
},

dynamicIsland: {
  position: "absolute",
  top: "12px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "110px",
  height: "28px",
  borderRadius: "20px",
  background: "#000",
  zIndex: 5,
},

trustStats: {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "28px",
  color: "#cbd5e1",
  fontWeight: "700",
},

floatingTagOne: {
  position: "absolute",
  right: "-8px",
  top: "45px",
  background: "white",
  color: "#111827",
  padding: "9px 13px",
  borderRadius: "14px",
  fontWeight: "800",
  fontSize: "12px",
},

floatingTagTwo: {
  position: "absolute",
  left: "-8px",
  bottom: "55px",
  background: "white",
  color: "#111827",
  padding: "9px 13px",
  borderRadius: "14px",
  fontWeight: "800",
  fontSize: "12px",
},

loginBrandIcon: {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#34d399,#22c55e)",
  color: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
},

loginNavLinks: {
  display: isMobile ? "none" : "flex",
  gap: "28px",
  color: "#cbd5e1",
  fontWeight: "700",
},

loginHero: {
  maxWidth: "1250px",
  minHeight: "calc(100vh - 110px)",
  margin: "0 auto",
  padding: "30px 32px 60px",
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
  gap: "50px",
  alignItems: "center",
  boxSizing: "border-box",
},

loginLeft: {
  maxWidth: "620px",
},

loginBadge: {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e2e8f0",
  fontWeight: "700",
  marginBottom: "24px",
},

loginHeroTitle: {
  fontSize: isMobile ? "44px" : "68px",
  lineHeight: "1.05",
  letterSpacing: "-2px",
  margin: "0 0 22px",
  fontWeight: "900",
},

loginHeroText: {
  fontSize: "18px",
  lineHeight: "1.7",
  color: "#94a3b8",
  maxWidth: "560px",
  marginBottom: "28px",
},

loginAccessBox: {
  width: "100%",
  maxWidth: "430px",
  padding: "20px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
},

loginLabel: {
  display: "block",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: "700",
},

loginInput: {
  width: "100%",
  padding: "15px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#1e293b",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
},

loginButton: {
  width: "100%",
  padding: "15px",
  marginTop: "14px",
  borderRadius: "14px",
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "white",
  fontWeight: "900",
  fontSize: "16px",
},

testerBox: {
  marginTop: "16px",
  padding: "14px",
  borderRadius: "14px",
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.2)",
},

testerTitle: {
  fontWeight: "900",
  marginBottom: "6px",
  color: "#34d399",
},

testerPassword: {
  color: "#cbd5e1",
},

loginRight: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},





scanCard: {
  padding: "16px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  textAlign: "center",
},

scanFrame: {
  height: "230px",
  borderRadius: "24px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#111827",
},






floatingTag: {
  position: "absolute",
  top: "30px",
  right: "-20px",
  background: "white",
  color: "#111",
  padding: "10px 14px",
  borderRadius: "14px",
  fontWeight: "700",
},



phoneTime: {
  fontSize: "13px",
  fontWeight: "800",
  justifySelf: "start",
},



iosIcons: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "7px",
},

cellularIcon: {
  display: "flex",
  alignItems: "flex-end",
  gap: "2px",
  height: "12px",
},

"cellularIcon span": {},

wifiSvg: {
  fontSize: "14px",
  fontWeight: "bold",
  display: "inline-block",
  transform: "rotate(90deg)",
  marginTop: "-1px",
},
batteryOuter: {
  width: "23px",
  height: "11px",
  border: "1.6px solid white",
  borderRadius: "4px",
  position: "relative",
  display: "inline-block",
  boxSizing: "border-box",
},

batteryInner: {
  position: "absolute",
  left: "2px",
  top: "2px",
  width: "15px",
  height: "5px",
  borderRadius: "2px",
  background: "white",
},

batteryCap: {
  position: "absolute",
  right: "-4px",
  top: "3px",
  width: "2px",
  height: "5px",
  borderRadius: "2px",
  background: "white",
},


phoneFrame: {
  width: isMobile ? "320px" : "345px",
  height: "760px",
  borderRadius: "52px",
  padding: "7px",
  background:
    "linear-gradient(135deg, #475569, #111827 35%, #020617 70%, #64748b)",
  boxShadow:
    "0 35px 90px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.25)",
  position: "relative",
},

phoneScreen: {
  width: "100%",
  height: "100%",
  borderRadius: "45px",
  background: "linear-gradient(180deg,#0f172a,#020617)",
  overflow: "hidden",
  padding: "16px",
  boxSizing: "border-box",
  position: "relative",
},

phoneStatusBar: {
  height: "34px",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  color: "white",
  marginBottom: "8px",
},

phoneTime: {
  fontSize: "13px",
  fontWeight: "800",
  justifySelf: "start",
  paddingLeft: "4px",
},

dynamicIsland: {
  width: "96px",
  height: "27px",
  borderRadius: "999px",
  background: "#000",
  justifySelf: "center",
  boxShadow: "inset 20px 0 25px rgba(255,255,255,0.03)",
},

iosIcons: {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "7px",
},

cellularIcon: {
  display: "flex",
  alignItems: "flex-end",
  gap: "2px",
  height: "12px",
},

wifiSvg: {
  fontSize: "15px",
  fontWeight: "bold",
  display: "inline-block",
  transform: "rotate(90deg)",
  marginTop: "-1px",
},

batteryOuter: {
  width: "23px",
  height: "11px",
  border: "1.6px solid white",
  borderRadius: "4px",
  position: "relative",
  display: "inline-block",
  boxSizing: "border-box",
},

batteryInner: {
  position: "absolute",
  left: "2px",
  top: "2px",
  width: "15px",
  height: "5px",
  borderRadius: "2px",
  background: "white",
},

batteryCap: {
  position: "absolute",
  right: "-4px",
  top: "3px",
  width: "2px",
  height: "5px",
  borderRadius: "2px",
  background: "white",
},

phoneHeader: {
  height: "46px",
  display: "grid",
  gridTemplateColumns: "40px 1fr 40px",
  alignItems: "center",
  marginBottom: "10px",
},

phoneTitle: {
  textAlign: "center",
  fontWeight: "800",
  fontSize: "16px",
  color: "white",
},

iconCircle: {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.13)",
  color: "white",
  fontSize: "18px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "default",
},

scanCard: {
  padding: "12px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  textAlign: "center",
},

scanFrame: {
  height: "225px",
  borderRadius: "20px",
  overflow: "hidden",
  position: "relative",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#111827",
},

mealImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

scanOverlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.25))",
},

scanCornerTopLeft: {
  position: "absolute",
  top: "60px",
  left: "58px",
  width: "32px",
  height: "32px",
  borderTop: "3px solid white",
  borderLeft: "3px solid white",
  borderRadius: "8px 0 0 0",
},

scanCornerTopRight: {
  position: "absolute",
  top: "60px",
  right: "58px",
  width: "32px",
  height: "32px",
  borderTop: "3px solid white",
  borderRight: "3px solid white",
  borderRadius: "0 8px 0 0",
},

scanCornerBottomLeft: {
  position: "absolute",
  bottom: "48px",
  left: "58px",
  width: "32px",
  height: "32px",
  borderBottom: "3px solid white",
  borderLeft: "3px solid white",
  borderRadius: "0 0 0 8px",
},

scanCornerBottomRight: {
  position: "absolute",
  bottom: "48px",
  right: "58px",
  width: "32px",
  height: "32px",
  borderBottom: "3px solid white",
  borderRight: "3px solid white",
  borderRadius: "0 0 8px 0",
},

foodLabelOne: {
  position: "absolute",
  top: "22px",
  left: "18px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.94)",
  color: "#111827",
  fontWeight: "900",
  fontSize: "12px",
},

foodLabelTwo: {
  position: "absolute",
  right: "14px",
  top: "68px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.94)",
  color: "#111827",
  fontWeight: "900",
  fontSize: "12px",
},

foodLabelThree: {
  position: "absolute",
  right: "20px",
  top: "118px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.94)",
  color: "#111827",
  fontWeight: "900",
  fontSize: "12px",
},

foodLabelFour: {
  position: "absolute",
  left: "20px",
  bottom: "22px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.94)",
  color: "#111827",
  fontWeight: "900",
  fontSize: "12px",
},

scanText: {
  color: "#cbd5e1",
  margin: "12px 0 0",
},

homeIndicator: {
  position: "absolute",
  bottom: "8px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "110px",
  height: "4px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.45)",
},



mealImage: {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
},

scanOverlay: {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.25))",
},

scanCornerTopLeft: {
  position: "absolute",
  top: "55px",
  left: "45px",
  width: "34px",
  height: "34px",
  borderTop: "3px solid white",
  borderLeft: "3px solid white",
  borderRadius: "8px 0 0 0",
},

scanCornerTopRight: {
  position: "absolute",
  top: "55px",
  right: "45px",
  width: "34px",
  height: "34px",
  borderTop: "3px solid white",
  borderRight: "3px solid white",
  borderRadius: "0 8px 0 0",
},

scanCornerBottomLeft: {
  position: "absolute",
  bottom: "55px",
  left: "45px",
  width: "34px",
  height: "34px",
  borderBottom: "3px solid white",
  borderLeft: "3px solid white",
  borderRadius: "0 0 0 8px",
},

scanCornerBottomRight: {
  position: "absolute",
  bottom: "55px",
  right: "45px",
  width: "34px",
  height: "34px",
  borderBottom: "3px solid white",
  borderRight: "3px solid white",
  borderRadius: "0 0 8px 0",
},

foodLabelOne: {
  position: "absolute",
  top: "22px",
  left: "18px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.9)",
  color: "#111827",
  fontWeight: "800",
  fontSize: "12px",
},

foodLabelTwo: {
  position: "absolute",
  right: "16px",
  top: "92px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.9)",
  color: "#111827",
  fontWeight: "800",
  fontSize: "12px",
},

foodLabelThree: {
  position: "absolute",
  left: "20px",
  bottom: "24px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.9)",
  color: "#111827",
  fontWeight: "800",
  fontSize: "12px",
},

scanText: {
  color: "#cbd5e1",
  marginBottom: 0,
},

previewStats: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "16px",
},

previewStat: {
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  color: "#94a3b8",
},

aiPreview: {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.2)",
  color: "#e2e8f0",
},
});

export default App;
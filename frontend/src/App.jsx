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
    setResult(`Estimated calories for ${food}: ${adjustedCalories} kcal (${goal})`);
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
    numericGoal > 0 ? Math.min((totalCaloriesToday / numericGoal) * 100, 100) : 0;

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
                  <div style={styles.scanCardTitle}>AI meal scan preview</div>

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

                    <div style={styles.foodLabelOne}>Chicken bowl · 520 kcal</div>
                    <div style={styles.foodLabelTwo}>Protein · 35 g</div>
                    <div style={styles.foodLabelFour}>Vegetables · 90 kcal</div>
                  </div>
                </div>

                <div style={styles.previewStats}>
                  <div style={styles.previewStat}>
                    <span>🔥 Calories</span>
                    <strong>520 kcal</strong>
                  </div>

                  <div style={styles.previewStat}>
                    <span>🥩 Protein</span>
                    <strong>35 g</strong>
                  </div>

                  <div style={styles.previewStat}>
                    <span>💧 Water</span>
                    <strong>1.5 L</strong>
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

  loginPage: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 35%), linear-gradient(135deg, #020617, #0f172a)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflow: isMobile ? "auto" : "hidden",
    boxSizing: "border-box",
  },

  loginNav: {
    height: "68px",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "18px 32px",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },

  loginBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "24px",
    fontWeight: "900",
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

  loginHero: {
    maxWidth: "1250px",
    height: isMobile ? "auto" : "calc(100vh - 68px)",
    margin: "0 auto",
    padding: isMobile ? "20px 24px 40px" : "6px 32px 20px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr",
    gap: isMobile ? "30px" : "34px",
    alignItems: "center",
    boxSizing: "border-box",
  },

  loginLeft: {
    maxWidth: "620px",
  },

  loginBadge: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: "700",
    marginBottom: "14px",
  },

  loginHeroTitle: {
    fontSize: isMobile ? "38px" : "48px",
    lineHeight: "1.05",
    letterSpacing: "-1.3px",
    margin: "0 0 12px",
    fontWeight: "900",
  },

  loginHeroText: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#94a3b8",
    maxWidth: "560px",
    marginBottom: "14px",
  },

  trustStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  loginAccessBox: {
    width: "100%",
    maxWidth: "430px",
    padding: "17px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  loginLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  loginInput: {
    width: "100%",
    padding: "13px",
    borderRadius: "13px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#1e293b",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    marginTop: "12px",
    borderRadius: "13px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "white",
    fontWeight: "900",
    fontSize: "16px",
  },

  testerBox: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "13px",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
  },

  testerTitle: {
    fontWeight: "900",
    marginBottom: "5px",
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

  phoneFrame: {
    width: isMobile ? "310px" : "325px",
    height: isMobile ? "630px" : "630px",
    borderRadius: "50px",
    padding: "7px",
    background:
      "linear-gradient(135deg, #64748b, #111827 35%, #020617 70%, #64748b)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    position: "relative",
    flexShrink: 0,
  },

  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: "43px",
    background: "linear-gradient(180deg,#0f172a,#020617)",
    overflow: "hidden",
    padding: "13px",
    boxSizing: "border-box",
    position: "relative",
  },

  phoneStatusBar: {
    height: "30px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    color: "white",
    marginBottom: "7px",
  },

  phoneTime: {
    fontSize: "12px",
    fontWeight: "800",
    paddingLeft: "4px",
  },

  dynamicIsland: {
    width: "90px",
    height: "25px",
    borderRadius: "999px",
    background: "#000",
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
    fontSize: "14px",
    fontWeight: "bold",
    transform: "rotate(90deg)",
    display: "inline-block",
  },

  batteryOuter: {
    width: "23px",
    height: "11px",
    border: "1.6px solid white",
    borderRadius: "4px",
    position: "relative",
    display: "inline-block",
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
    height: "40px",
    display: "grid",
    gridTemplateColumns: "34px 1fr 34px",
    alignItems: "center",
    marginBottom: "7px",
  },

  phoneTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "15px",
  },

  iconCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.13)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scanCard: {
    padding: "9px",
    borderRadius: "19px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  scanCardTitle: {
    color: "#e2e8f0",
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "8px",
  },

  scanFrame: {
    height: "178px",
    borderRadius: "17px",
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.18)",
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
      "linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.18))",
  },

  foodLabelOne: {
    position: "absolute",
    top: "14px",
    left: "12px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  foodLabelTwo: {
    position: "absolute",
    right: "10px",
    top: "72px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  foodLabelFour: {
    position: "absolute",
    left: "14px",
    bottom: "18px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  scanCornerTopLeft: {
    position: "absolute",
    top: "54px",
    left: "52px",
    width: "26px",
    height: "26px",
    borderTop: "3px solid white",
    borderLeft: "3px solid white",
  },

  scanCornerTopRight: {
    position: "absolute",
    top: "54px",
    right: "52px",
    width: "26px",
    height: "26px",
    borderTop: "3px solid white",
    borderRight: "3px solid white",
  },

  scanCornerBottomLeft: {
    position: "absolute",
    bottom: "39px",
    left: "52px",
    width: "26px",
    height: "26px",
    borderBottom: "3px solid white",
    borderLeft: "3px solid white",
  },

  scanCornerBottomRight: {
    position: "absolute",
    bottom: "39px",
    right: "52px",
    width: "26px",
    height: "26px",
    borderBottom: "3px solid white",
    borderRight: "3px solid white",
  },

  previewStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "10px",
  },

  previewStat: {
    padding: "9px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  aiPreview: {
    marginTop: "10px",
    padding: "11px",
    borderRadius: "15px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#e2e8f0",
    fontSize: "13px",
  },

  homeIndicator: {
    position: "absolute",
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "105px",
    height: "4px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.45)",
  },
});

export default App;
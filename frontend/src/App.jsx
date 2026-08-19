// Force-refresh marker for Vercel deploy cache verification
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Beef, Droplet, Droplets, Eye, Flame, Sparkles, Wheat } from "lucide-react";

import { useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import { useViewport } from "./hooks/useViewport";
import { ApiError, mealsApi } from "./lib/api";
import { isToday } from "./lib/dates";

import FoodInput from "./components/FoodInput";
import MealHistory from "./components/MealHistory";
import ProgressRing from "./components/ProgressRing";
import WeeklySummary from "./components/WeeklySummary";
import Sidebar from "./components/Sidebar";
import TabBar from "./components/TabBar";
import TopBar from "./components/TopBar";
import StatCard from "./components/StatCard";
import ThemeToggle from "./components/ThemeToggle";

import Meals from "./pages/Meals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";

const MotionDiv = motion.div;

const fadeRiseGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeRiseItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } },
};

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const { isMobile, isDesktop } = useViewport();
  const { darkMode, toggle: toggleTheme } = useTheme();

  const [food, setFood] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Entirely separate from result/error above — a preview never touches
  // `meals` state, which is what guarantees it can't affect Today's Total
  // or MealHistory no matter what.
  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [water, setWater] = useState(() => {
    return Number(localStorage.getItem("fitsense_water") || 0);
  });

  const [meals, setMeals] = useState([]);

  useEffect(() => {
    if (!user) return;

    mealsApi
      .list()
      .then((fetchedMeals) =>
        setMeals(fetchedMeals.map((meal) => ({ ...meal, timestamp: meal.created_at })))
      )
      .catch(() => setMeals([]));
  }, [user]);

  // AI-generated meal photos finish after the response that logged the meal
  // already returned (see backend/services/photo_generator.py) — poll while
  // any meal is still waiting on one, so the placeholder swaps to the real
  // photo without the user needing to refresh. Stops itself as soon as
  // nothing is pending.
  useEffect(() => {
    const hasPending = meals.some((meal) => meal.photo_status === "pending");
    if (!hasPending) return;

    const interval = setInterval(() => {
      mealsApi
        .list()
        .then((fetchedMeals) =>
          setMeals(fetchedMeals.map((meal) => ({ ...meal, timestamp: meal.created_at })))
        )
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("fitsense_water", water);
  }, [water]);

  // Reset the meal-analysis panel whenever the session itself changes
  // (login, logout, or switching accounts) — otherwise the last result from
  // a previous session lingers indefinitely, since this state lives on the
  // top-level App component, which never unmounts across auth transitions.
  // Keyed on the id specifically, not the whole user object: profile edits
  // (Settings) also call setUser with a new object for the same account,
  // and that shouldn't wipe an unrelated in-progress meal result.
  useEffect(() => {
    setResult("");
    setError("");
    setFood("");
    setPreviewResult(null);
    setPreviewError("");
  }, [user?.id]);

  const estimateCalories = async () => {
    if (!food) return;

    setLoading(true);
    setError("");
    setResult("");
    setPreviewResult(null);
    setPreviewError("");

    try {
      const newMeal = await mealsApi.create(food);
      setMeals((prevMeals) => [
        ...prevMeals,
        { ...newMeal, timestamp: newMeal.created_at },
      ]);
      setResult(`Estimated calories for ${food}: ${newMeal.calories} kcal (${user.goal})`);
      setFood("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to analyze meal.");
    } finally {
      setLoading(false);
    }
  };

  const previewMeal = async () => {
    if (!food) return;

    setPreviewLoading(true);
    setPreviewError("");
    setResult("");
    setError("");

    try {
      const preview = await mealsApi.preview(food);
      setPreviewResult(preview);
    } catch (err) {
      setPreviewError(err instanceof ApiError ? err.message : "Failed to preview meal.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const logPreviewedMeal = async () => {
    if (!previewResult) return;

    setLoading(true);
    setError("");

    try {
      const newMeal = await mealsApi.create(previewResult.food, {
        calories: previewResult.calories,
        protein: previewResult.protein,
        carbs: previewResult.carbs,
        fat: previewResult.fat,
        source: previewResult.source,
      });
      setMeals((prevMeals) => [
        ...prevMeals,
        { ...newMeal, timestamp: newMeal.created_at },
      ]);
      setResult(`Estimated calories for ${newMeal.food}: ${newMeal.calories} kcal (${user.goal})`);
      setPreviewResult(null);
      setFood("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log meal.");
    } finally {
      setLoading(false);
    }
  };

  const todaysMeals = meals.filter((meal) => isToday(meal.timestamp));

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

  const calorieTarget = user?.calorie_target || 0;

  const progressPercent =
    calorieTarget > 0 ? Math.min((totalCaloriesToday / calorieTarget) * 100, 100) : 0;

  const caloriesRemaining =
    calorieTarget - totalCaloriesToday > 0 ? calorieTarget - totalCaloriesToday : 0;

  const waterProgressPercent =
    user?.water_target_l > 0 ? Math.min((water / user.water_target_l) * 100, 100) : 0;

  const proteinTarget = user?.protein_target || 0;
  const carbTarget = user?.carb_target || 0;
  const fatTarget = user?.fat_target || 0;

  // Kept short deliberately — this renders inside a small ring, and longer
  // phrasing overlapped the ring stroke. The overage arc itself already
  // shows direction, so the caption just needs the amount.
  const macroCaption = (actual, target) =>
    target > 0 && actual > target ? `+${actual - target}g` : `of ${target}g goal`;

  const goalTips = {
    cutting: "You're cutting — prioritize protein to preserve muscle while in a deficit.",
    maintenance: "You're at maintenance — keep intake steady and consistent day to day.",
    bulking: "You're bulking — make sure the extra calories are pulling their weight, not just carbs and fat.",
  };

  const deleteMeal = async (id) => {
    try {
      await mealsApi.remove(id);
      setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete meal.");
    }
  };

  const styles = getStyles(isMobile, isDesktop);

  if (authLoading) {
    return <div style={styles.authLoading}>Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Register />} />
      </Routes>
    );
  }

  if (!user.has_onboarded) {
    return <Onboarding />;
  }

  return (
    <div style={styles.page}>
      {isDesktop && (
        <div style={styles.sidebarWrapper}>
          <Sidebar />
        </div>
      )}

      <div style={styles.mainArea}>
        <div style={styles.topBarWrapper}>
          <TopBar userEmail={user.email} onLogout={logout} />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div style={styles.contentArea}>
                <div style={styles.dashboardWrapper}>
                  <div style={{ ...styles.dashboard, ...styles.mobileStack }}>
                    <div style={styles.container}>
                      <h1 style={styles.title}>FitSense AI</h1>

                      <div style={{ marginBottom: "20px" }}>
                        <ThemeToggle darkMode={darkMode} onToggle={toggleTheme} />
                      </div>

                      <p style={styles.subtitle}>
                        Smart calorie insights based on your fitness goal
                      </p>

                      <FoodInput
                        food={food}
                        setFood={setFood}
                        onSubmit={estimateCalories}
                        loading={loading}
                        onPreview={previewMeal}
                        previewLoading={previewLoading}
                      />

                      {result && <div style={styles.result}>{result}</div>}
                      {error && <div style={styles.error}>{error}</div>}

                      {previewResult && (
                        <div style={styles.previewPanel}>
                          <div style={styles.previewLabel}>
                            <Eye size={13} strokeWidth={2.5} /> Preview — not saved
                          </div>
                          <p style={styles.previewText}>
                            This is a preview only. Nothing has been logged.
                          </p>
                          <p style={styles.previewText}>
                            <strong>{previewResult.food}</strong>: {previewResult.calories} kcal,{" "}
                            {previewResult.protein}g protein, {previewResult.carbs}g carbs,{" "}
                            {previewResult.fat}g fat
                          </p>
                          <button
                            onClick={logPreviewedMeal}
                            disabled={loading}
                            style={styles.previewLogButton}
                          >
                            {loading ? "Logging..." : "Log This Meal"}
                          </button>
                        </div>
                      )}
                      {previewError && <div style={styles.error}>{previewError}</div>}

                      <MotionDiv
                        style={styles.statsRow}
                        variants={fadeRiseGroup}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-40px" }}
                      >
                        <MotionDiv variants={fadeRiseItem} style={{ display: "flex", flex: 1 }}>
                          <StatCard label="Calories" value={totalCaloriesToday} unit="kcal" icon={(p) => <Flame {...p} />} />
                        </MotionDiv>
                        <MotionDiv variants={fadeRiseItem} style={{ display: "flex", flex: 1 }}>
                          <StatCard label="Protein" value={totalProteinToday} unit="g" icon={(p) => <Beef {...p} />} />
                        </MotionDiv>
                        <MotionDiv variants={fadeRiseItem} style={{ display: "flex", flex: 1 }}>
                          <StatCard label="Carbs" value={totalCarbsToday} unit="g" icon={(p) => <Wheat {...p} />} />
                        </MotionDiv>
                        <MotionDiv variants={fadeRiseItem} style={{ display: "flex", flex: 1 }}>
                          <StatCard label="Fat" value={totalFatToday} unit="g" icon={(p) => <Droplets {...p} />} />
                        </MotionDiv>
                        <MotionDiv variants={fadeRiseItem} style={{ display: "flex", flex: 1 }}>
                          <StatCard label="Water" value={water} unit="L" icon={(p) => <Droplet {...p} />} />
                        </MotionDiv>
                      </MotionDiv>

                      <div style={styles.waterButtons}>
                        <button onClick={() => setWater(water + 0.25)} style={styles.smallButton}>
                          +250ml
                        </button>

                        <button onClick={() => setWater(water + 0.5)} style={styles.smallButton}>
                          +500ml
                        </button>

                        <button onClick={() => setWater(0)} style={styles.smallButton}>
                          Reset Water
                        </button>
                      </div>

                      <div style={styles.totalBox}>
                        <div style={styles.totalRow}>
                          <Flame size={17} strokeWidth={2.5} color="var(--ink)" />
                          <span>
                            Today's Total: <strong>{totalCaloriesToday}</strong> / {calorieTarget} kcal
                          </span>
                        </div>

                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
                        </div>

                        <div style={{ ...styles.totalRow, marginTop: "16px" }}>
                          <Droplet size={17} strokeWidth={2.5} color="var(--ink)" />
                          <span>
                            Water: <strong>{water}L</strong> / {user.water_target_l}L
                          </span>
                        </div>

                        <div style={styles.progressBar}>
                          <div style={{ ...styles.progressFill, width: `${waterProgressPercent}%` }} />
                        </div>
                      </div>

                      <div style={styles.aiCoach}>
                        <h3 style={styles.aiCoachTitle}>
                          <Sparkles size={17} strokeWidth={2.5} /> AI Coach
                        </h3>
                        <p>
                          You're <strong>{caloriesRemaining} kcal</strong> away from today's goal.
                        </p>
                        <p>
                          Protein consumed today: <strong>{totalProteinToday}g</strong>
                        </p>
                        <p>{goalTips[user.goal] || goalTips.maintenance}</p>
                      </div>

                      <MotionDiv
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-40px" }}
                        variants={fadeRiseItem}
                      >
                        <MealHistory meals={meals} onDelete={deleteMeal} />
                      </MotionDiv>
                    </div>

                    <div style={styles.leftPanel}>
                      <h3 style={styles.ringSectionTitle}>Today's Progress</h3>

                      <div style={styles.ringRow}>
                        <ProgressRing
                          value={totalCaloriesToday}
                          max={calorieTarget}
                          unit="kcal"
                          caption={`of ${calorieTarget} kcal goal`}
                        />

                      </div>

                      <div style={styles.macroRingRow}>
                        <div style={styles.macroRingItem}>
                          <ProgressRing
                            value={totalProteinToday}
                            max={proteinTarget}
                            size={108}
                            strokeWidth={9}
                            unit="g"
                            caption={macroCaption(totalProteinToday, proteinTarget)}
                            showOverage
                          />
                          <div style={styles.macroRingLabel}>
                            <Beef size={13} strokeWidth={2.4} /> Protein
                          </div>
                        </div>

                        <div style={styles.macroRingItem}>
                          <ProgressRing
                            value={totalCarbsToday}
                            max={carbTarget}
                            size={108}
                            strokeWidth={9}
                            unit="g"
                            caption={macroCaption(totalCarbsToday, carbTarget)}
                            showOverage
                          />
                          <div style={styles.macroRingLabel}>
                            <Wheat size={13} strokeWidth={2.4} /> Carbs
                          </div>
                        </div>

                        <div style={styles.macroRingItem}>
                          <ProgressRing
                            value={totalFatToday}
                            max={fatTarget}
                            size={108}
                            strokeWidth={9}
                            unit="g"
                            caption={macroCaption(totalFatToday, fatTarget)}
                            showOverage
                          />
                          <div style={styles.macroRingLabel}>
                            <Droplets size={13} strokeWidth={2.4} /> Fat
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.chartPanel}>
                    <WeeklySummary meals={meals} calorieTarget={calorieTarget} />
                  </div>
                </div>
              </div>
            }
          />

          <Route path="/meals" element={<Meals meals={meals} setMeals={setMeals} />} />
          <Route path="/analytics" element={<Analytics meals={meals} calorieTarget={calorieTarget} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isDesktop && <TabBar />}
    </div>
  );
}

const getStyles = (isMobile, isDesktop) => ({
  authLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    background: "var(--paper)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
  },

  page: {
    display: "flex",
    flexDirection: isDesktop ? "row" : "column",
    width: "100vw",
    minHeight: "100dvh",
    background: "var(--paper)",
    color: "var(--ink)",
  },

  sidebarWrapper: {
    width: "240px",
    flexShrink: 0,
  },

  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    paddingLeft: 0,
    paddingBottom: isDesktop ? 0 : "78px",
    minWidth: 0,
  },

  topBarWrapper: {
    width: "100%",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },

  contentArea: {
    flex: 1,
    overflowY: "auto",
    padding: isDesktop ? "40px 30px" : "24px 16px",
  },

  dashboardWrapper: {
    width: "93%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
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
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
    minWidth: 0,
  },

  chartPanel: {
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
    minWidth: 0,
  },

  ringSectionTitle: {
    fontSize: "16px",
    marginBottom: "18px",
  },

  ringRow: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
    flexWrap: "wrap",
  },

  macroRingRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "26px",
  },

  macroRingItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  macroRingLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--graphite)",
  },

  container: {
    padding: "30px",
    textAlign: "center",
    fontFamily: "var(--font-body)",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
    maxWidth: "560px",
    margin: "0 auto",
    minWidth: 0,
  },

  title: {
    fontSize: "32px",
    marginBottom: "8px",
  },

  subtitle: {
    color: "var(--graphite)",
    marginBottom: "30px",
    fontSize: "14px",
  },

  statsRow: {
    display: "flex",
    gap: "12px",
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
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "border-color var(--duration-hover) ease, transform var(--duration-hover) var(--ease-out)",
  },

  totalBox: {
    marginBottom: "20px",
    padding: "18px 20px",
    borderRadius: "var(--radius-md)",
    background: "var(--paper)",
    border: "1px solid var(--line)",
    textAlign: "left",
  },

  totalRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },

  progressBar: {
    height: "8px",
    background: "var(--line)",
    borderRadius: "var(--radius-full)",
    marginTop: "10px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "var(--oxblood)",
    borderRadius: "var(--radius-full)",
    transition: "width 0.6s var(--ease-out)",
  },

  aiCoach: {
    textAlign: "left",
    background: "var(--paper)",
    padding: "18px 20px",
    borderRadius: "var(--radius-md)",
    marginTop: "20px",
    marginBottom: "20px",
    border: "1px solid var(--line)",
    fontSize: "14px",
  },

  aiCoachTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "var(--text-subhead)",
  },

  result: {
    marginTop: "25px",
    fontSize: "15px",
    fontWeight: "600",
    color: "var(--ink)",
  },

  // Dashed border (every real content card in the app uses a solid one) +
  // an explicit "not saved" label — deliberately can't be mistaken for a
  // logged meal at a glance.
  previewPanel: {
    marginTop: "25px",
    padding: "18px",
    borderRadius: "var(--radius-md)",
    border: "1px dashed var(--line)",
    background: "var(--paper)",
  },

  previewLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--oxblood)",
    marginBottom: "10px",
  },

  previewText: {
    fontSize: "14px",
    color: "var(--ink)",
    margin: "0 0 10px",
  },

  previewLogButton: {
    padding: "11px 20px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    background: "var(--oxblood)",
    color: "#f5efe8",
    fontWeight: "600",
    fontSize: "14px",
  },

  error: {
    marginTop: "20px",
    color: "var(--oxblood)",
    fontSize: "14px",
  },
});

export default App;

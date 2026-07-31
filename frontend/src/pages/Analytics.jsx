import { motion } from "framer-motion";
import { Beef, Flame, Sparkles, Target, Trophy } from "lucide-react";
import WeeklySummary from "../components/WeeklySummary";

const MotionDiv = motion.div;

const fadeRiseGroup = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeRiseItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

function Analytics({ meals, calorieTarget }) {
  const totalCalories = meals.reduce(
    (sum, meal) => sum + (meal.calories || 0),
    0
  );

  const totalProtein = meals.reduce(
    (sum, meal) => sum + (meal.protein || 0),
    0
  );

  const uniqueDays = [
    ...new Set(meals.map((meal) => new Date(meal.timestamp).toDateString())),
  ];

  const averageCalories =
    uniqueDays.length > 0 ? Math.round(totalCalories / uniqueDays.length) : 0;

  const averageProtein =
    meals.length > 0 ? Math.round(totalProtein / meals.length) : 0;

  const bestDayCalories = Math.max(
    ...meals.map((meal) => meal.calories || 0),
    0
  );

  const goalCompletion = calorieTarget
    ? Math.min(Math.round((averageCalories / calorieTarget) * 100), 100)
    : 0;

  const streak = uniqueDays.length;

  let aiInsight = "";

  if (averageCalories < 1800) {
    aiInsight =
      "You are currently maintaining a calorie deficit. Keep protein intake high to support muscle retention.";
  } else if (averageCalories > 2500) {
    aiInsight =
      "Your calorie intake is relatively high, which may support muscle gain if paired with strength training.";
  } else {
    aiInsight =
      "Your calorie intake is within a maintenance range. This is good for consistency and steady progress.";
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>
          Understand your calorie trends, protein intake, and consistency.
        </p>
      </div>

      <MotionDiv style={styles.statsGrid} variants={fadeRiseGroup} initial="hidden" animate="visible">
        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}>Average calories</p>
          <h2 style={styles.value}>{averageCalories} <span style={styles.unit}>kcal</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}>Meals logged</p>
          <h2 style={styles.value}>{meals.length}</h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}>Total protein</p>
          <h2 style={styles.value}>{totalProtein} <span style={styles.unit}>g</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}>Active days</p>
          <h2 style={styles.value}>{uniqueDays.length}</h2>
        </MotionDiv>
      </MotionDiv>

      <div style={styles.chartCard}>
        <WeeklySummary meals={meals} calorieTarget={calorieTarget} />
      </div>

      <MotionDiv style={styles.insightGrid} variants={fadeRiseGroup} initial="hidden" animate="visible">
        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}><Flame size={15} strokeWidth={2.5} /> Current Streak</p>
          <h2 style={styles.value}>{streak} <span style={styles.unit}>days</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}><Target size={15} strokeWidth={2.5} /> Goal Achievement</p>
          <h2 style={styles.value}>{goalCompletion}<span style={styles.unit}>%</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}><Trophy size={15} strokeWidth={2.5} /> Best Meal</p>
          <h2 style={styles.value}>{bestDayCalories} <span style={styles.unit}>kcal</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.card}>
          <p style={styles.label}><Beef size={15} strokeWidth={2.5} /> Avg Protein</p>
          <h2 style={styles.value}>{averageProtein} <span style={styles.unit}>g</span></h2>
        </MotionDiv>

        <MotionDiv variants={fadeRiseItem} style={styles.insightsCard}>
          <h2 style={styles.insightsTitle}><Sparkles size={17} strokeWidth={2.5} /> AI Insights</h2>

          <ul style={styles.insightList}>
            <li>{aiInsight}</li>
            <li>You average {averageCalories} kcal per day.</li>
            <li>You have logged {meals.length} meals so far.</li>
            <li>Your average protein intake is {averageProtein} g.</li>
            <li>Current consistency streak: {streak} days.</li>
          </ul>
        </MotionDiv>
      </MotionDiv>
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
    marginBottom: "30px",
  },

  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "25px",
  },

  insightsCard: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
    width: "100%",
    gridColumn: "1 / -1",
  },

  insightsTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: 0,
    fontSize: "var(--text-subhead)",
  },

  insightList: {
    color: "var(--graphite)",
    lineHeight: "2",
    paddingLeft: "20px",
    fontSize: "14px",
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

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    padding: "18px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--graphite)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    margin: 0,
  },

  value: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "28px",
    color: "var(--ink)",
    marginTop: "10px",
    marginBottom: 0,
  },

  unit: {
    fontFamily: "var(--font-mono)",
    fontWeight: "500",
    fontSize: "14px",
    color: "var(--graphite)",
  },

  chartCard: {
    padding: "25px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    boxShadow: "var(--shadow)",
  },
};

export default Analytics;

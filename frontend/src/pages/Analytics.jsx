import WeeklySummary from "../components/WeeklySummary";

function Analytics({ meals }) {
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

  const goalCompletion = Math.min(
    Math.round((averageCalories / 2000) * 100),
    100
  );

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

      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.label}>Average calories</p>
          <h2 style={styles.value}>{averageCalories} kcal</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Meals logged</p>
          <h2 style={styles.value}>{meals.length}</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Total protein</p>
          <h2 style={styles.value}>{totalProtein} g</h2>
        </div>

        <div style={styles.card}>
          <p style={styles.label}>Active days</p>
          <h2 style={styles.value}>{uniqueDays.length}</h2>
        </div>
      </div>

      <div style={styles.chartCard}>
        <WeeklySummary meals={meals} />
      </div>

      <div style={styles.insightGrid}>

  <div style={styles.card}>
    <p style={styles.label}>🔥 Current Streak</p>
    <h2 style={styles.value}>{streak} days</h2>
  </div>

  <div style={styles.card}>
    <p style={styles.label}>🎯 Goal Achievement</p>
    <h2 style={styles.value}>{goalCompletion}%</h2>
  </div>

  <div style={styles.card}>
    <p style={styles.label}>🏆 Best Meal</p>
    <h2 style={styles.value}>{bestDayCalories} kcal</h2>
  </div>

  <div style={styles.card}>
    <p style={styles.label}>🍗 Avg Protein</p>
    <h2 style={styles.value}>{averageProtein} g</h2>
  </div>

  <div style={styles.insightsCard}>
  <h2 style={{ marginTop: 0 }}>🤖 AI Insights</h2>
  

  <ul style={styles.insightList}>
    <li>{aiInsight}</li>
    <li>You average {averageCalories} kcal per day.</li>
    <li>You have logged {meals.length} meals so far.</li>
    <li>Your average protein intake is {averageProtein} g.</li>
    <li>Current consistency streak: {streak} days.</li>
  </ul>
</div>



</div>



    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    color: "white",
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
  borderRadius: "18px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.1)",
  width: "100%",
},

insightList: {
  color: "#cbd5e1",
  lineHeight: "2",
  paddingLeft: "20px",
},

  title: {
    fontSize: "34px",
    margin: 0,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    padding: "18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  label: {
    color: "#94a3b8",
    margin: 0,
  },

  value: {
    color: "#00ff87",
    marginTop: "10px",
    marginBottom: 0,
  },

  chartCard: {
    padding: "25px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

export default Analytics;
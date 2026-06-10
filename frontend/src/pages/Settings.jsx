import { useState } from "react";

function Settings() {
  const [name, setName] = useState(localStorage.getItem("fitsense_name") || "");
  const [age, setAge] = useState(localStorage.getItem("fitsense_age") || "");
  const [height, setHeight] = useState(localStorage.getItem("fitsense_height") || "");
  const [weight, setWeight] = useState(localStorage.getItem("fitsense_weight") || "");
  const [goal, setGoal] = useState(localStorage.getItem("fitsense_goal") || "maintenance");

  const [calorieTarget, setCalorieTarget] = useState(
    localStorage.getItem("fitsense_calorie_target") || "2000"
  );

  const [proteinTarget, setProteinTarget] = useState(
    localStorage.getItem("fitsense_protein_target") || "180"
  );

  const [waterTarget, setWaterTarget] = useState(
    localStorage.getItem("fitsense_water_target") || "3"
  );

  const saveSettings = () => {
    localStorage.setItem("fitsense_name", name);
    localStorage.setItem("fitsense_age", age);
    localStorage.setItem("fitsense_height", height);
    localStorage.setItem("fitsense_weight", weight);
    localStorage.setItem("fitsense_goal", goal);
    localStorage.setItem("fitsense_calorie_target", calorieTarget);
    localStorage.setItem("fitsense_protein_target", proteinTarget);
    localStorage.setItem("fitsense_water_target", waterTarget);

    alert("Settings saved successfully.");
  };

  const resetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>
          Personalize your FitSense profile, goals, and nutrition targets.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.avatar}>
          {name ? name.charAt(0).toUpperCase() : "F"}
        </div>

        <h3 style={styles.sectionTitle}>Profile</h3>

        <div style={styles.grid}>
          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Height (cm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <h3 style={styles.sectionTitle}>Fitness Goal</h3>

        <select
          style={styles.input}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        >
          <option value="cutting">Cutting</option>
          <option value="maintenance">Maintenance</option>
          <option value="bulking">Bulking</option>
        </select>

        <h3 style={styles.sectionTitle}>Targets</h3>

        <div style={styles.grid}>
          <input
            style={styles.input}
            placeholder="Daily Calories"
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Protein Goal (g)"
            value={proteinTarget}
            onChange={(e) => setProteinTarget(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Water Goal (L)"
            value={waterTarget}
            onChange={(e) => setWaterTarget(e.target.value)}
          />
        </div>

        <div style={styles.actions}>
          <button style={styles.saveBtn} onClick={saveSettings}>
            Save Settings
          </button>

          <button style={styles.resetBtn} onClick={resetData}>
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
page: {
  padding: "40px",
  maxWidth: "1100px",
  margin: "0 auto",
  color: "white",
  boxSizing: "border-box",
},

  header: {
    marginBottom: "30px",
  },

  title: {
    fontSize: "48px",
    margin: 0,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: "8px",
  },

card: {
  width: "100%",
  maxWidth: "900px",
  background: "rgba(255,255,255,0.07)",
  padding: "40px",
  borderRadius: "22px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxSizing: "border-box",
},

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#34d399,#22c55e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
    color: "#0f172a",
    margin: "0 auto 30px",
    boxShadow: "0 8px 25px rgba(52,211,153,0.3)",
  },

  sectionTitle: {
    marginTop: "24px",
    marginBottom: "14px",
    fontSize: "22px",
    fontWeight: "700",
  },

 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
},
input: {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#1e293b",
  color: "white",
  outline: "none",
  boxSizing: "border-box",
},

  actions: {
    display: "flex",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },

  saveBtn: {
    padding: "14px 24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
  },

  resetBtn: {
    padding: "14px 24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ef4444",
    color: "white",
    fontWeight: "bold",
  },
};

export default Settings;
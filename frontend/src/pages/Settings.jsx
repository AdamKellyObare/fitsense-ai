import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { estimateTargets } from "../lib/targets";

function fieldsFromUser(user) {
  return {
    name: user?.name || "",
    age: user?.age ?? "",
    height: user?.height_cm ?? "",
    weight: user?.weight_kg ?? "",
    sex: user?.sex || "",
    activityLevel: user?.activity_level || "moderate",
    goal: user?.goal || "maintenance",
    calorieTarget: user?.calorie_target ?? "",
    proteinTarget: user?.protein_target ?? "",
    carbTarget: user?.carb_target ?? "",
    fatTarget: user?.fat_target ?? "",
    waterTarget: user?.water_target_l ?? "",
  };
}

function Settings() {
  const { user, updateProfile } = useAuth();
  const [fields, setFields] = useState(() => fieldsFromUser(user));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const setField = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const autoCalculate = () => {
    const suggestion = estimateTargets({
      age: Number(fields.age),
      sex: fields.sex || undefined,
      heightCm: Number(fields.height),
      weightKg: Number(fields.weight),
      goal: fields.goal,
      activityLevel: fields.activityLevel,
    });

    if (!suggestion) {
      setStatus({ type: "error", message: "Enter your age, height, and weight first." });
      return;
    }

    setFields((prev) => ({
      ...prev,
      calorieTarget: suggestion.calorie_target,
      proteinTarget: suggestion.protein_target,
      carbTarget: suggestion.carb_target,
      fatTarget: suggestion.fat_target,
    }));
    setStatus({ type: "success", message: "Targets estimated — review below, then save." });
  };

  const saveSettings = async () => {
    setSaving(true);
    setStatus(null);

    try {
      await updateProfile({
        name: fields.name || null,
        age: fields.age === "" ? null : Number(fields.age),
        height_cm: fields.height === "" ? null : Number(fields.height),
        weight_kg: fields.weight === "" ? null : Number(fields.weight),
        sex: fields.sex || null,
        activity_level: fields.activityLevel,
        goal: fields.goal,
        calorie_target: Number(fields.calorieTarget),
        protein_target: Number(fields.proteinTarget),
        carb_target: Number(fields.carbTarget),
        fat_target: Number(fields.fatTarget),
        water_target_l: Number(fields.waterTarget),
      });
      setStatus({ type: "success", message: "Settings saved." });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof ApiError ? err.message : "Failed to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setFields(fieldsFromUser(user));
    setStatus(null);
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
          {fields.name ? fields.name.charAt(0).toUpperCase() : "F"}
        </div>

        {status && (
          <div style={status.type === "error" ? styles.errorBanner : styles.successBanner}>
            {status.message}
          </div>
        )}

        <h3 style={styles.sectionTitle}>Profile</h3>

        <div style={styles.grid}>
          <input
            style={styles.input}
            placeholder="Name"
            value={fields.name}
            onChange={setField("name")}
          />

          <input
            style={styles.input}
            placeholder="Age"
            value={fields.age}
            onChange={setField("age")}
          />

          <input
            style={styles.input}
            placeholder="Height (cm)"
            value={fields.height}
            onChange={setField("height")}
          />

          <input
            style={styles.input}
            placeholder="Weight (kg)"
            value={fields.weight}
            onChange={setField("weight")}
          />

          <select style={styles.input} value={fields.sex} onChange={setField("sex")}>
            <option value="">Sex (used only to estimate targets)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <h3 style={styles.sectionTitle}>Fitness Goal</h3>

        <div style={styles.grid}>
          <select style={styles.input} value={fields.goal} onChange={setField("goal")}>
            <option value="cutting">Cutting</option>
            <option value="maintenance">Maintenance</option>
            <option value="bulking">Bulking</option>
          </select>

          <select
            style={styles.input}
            value={fields.activityLevel}
            onChange={setField("activityLevel")}
          >
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very active (physical job/training)</option>
          </select>
        </div>

        <h3 style={styles.sectionTitle}>Targets</h3>

        <button style={styles.autoCalcBtn} onClick={autoCalculate} type="button">
          ✨ Auto-calculate from profile
        </button>

        <div style={styles.grid}>
          <input
            style={styles.input}
            placeholder="Daily Calories"
            value={fields.calorieTarget}
            onChange={setField("calorieTarget")}
          />

          <input
            style={styles.input}
            placeholder="Protein Goal (g)"
            value={fields.proteinTarget}
            onChange={setField("proteinTarget")}
          />

          <input
            style={styles.input}
            placeholder="Carb Goal (g)"
            value={fields.carbTarget}
            onChange={setField("carbTarget")}
          />

          <input
            style={styles.input}
            placeholder="Fat Goal (g)"
            value={fields.fatTarget}
            onChange={setField("fatTarget")}
          />

          <input
            style={styles.input}
            placeholder="Water Goal (L)"
            value={fields.waterTarget}
            onChange={setField("waterTarget")}
          />
        </div>

        <div style={styles.actions}>
          <button style={styles.saveBtn} onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button style={styles.resetBtn} onClick={discardChanges}>
            Discard Changes
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

  autoCalcBtn: {
    padding: "12px 18px",
    marginBottom: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(52,211,153,0.4)",
    background: "rgba(52,211,153,0.12)",
    color: "#34d399",
    cursor: "pointer",
    fontWeight: "bold",
  },

  errorBanner: {
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "rgba(239,68,68,0.12)",
    color: "#ef4444",
  },

  successBanner: {
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "rgba(34,197,94,0.12)",
    color: "#22c55e",
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
    background: "#334155",
    color: "white",
    fontWeight: "bold",
  },
};

export default Settings;

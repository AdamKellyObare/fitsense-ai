import { useState } from "react";
import { AlertCircle, Check, Sparkles } from "lucide-react";
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
            {status.type === "error" ? (
              <AlertCircle size={17} strokeWidth={2.5} />
            ) : (
              <Check size={17} strokeWidth={2.5} />
            )}
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
          <Sparkles size={16} strokeWidth={2.5} /> Auto-calculate from profile
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
  color: "var(--ink)",
  boxSizing: "border-box",
},

  header: {
    marginBottom: "30px",
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

card: {
  width: "100%",
  maxWidth: "900px",
  background: "var(--paper-raised)",
  padding: "40px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--line)",
  boxShadow: "var(--shadow)",
  boxSizing: "border-box",
},

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "var(--oxblood)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: "36px",
    fontWeight: "700",
    color: "#f5efe8",
    margin: "0 auto 30px",
  },

  sectionTitle: {
    marginTop: "24px",
    marginBottom: "14px",
    fontSize: "20px",
  },

 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
},
input: {
  width: "100%",
  padding: "14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink)",
  outline: "none",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  boxSizing: "border-box",
},

  autoCalcBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    marginBottom: "14px",
    borderRadius: "var(--radius-full)",
    border: "1px solid rgba(var(--oxblood-rgb), 0.35)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    color: "var(--oxblood)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    color: "var(--oxblood)",
    fontSize: "14px",
  },

  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "var(--radius-md)",
    background: "var(--paper)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    gap: "14px",
    marginTop: "28px",
    flexWrap: "wrap",
  },

  saveBtn: {
    padding: "14px 24px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    background: "var(--oxblood)",
    color: "#f5efe8",
    fontWeight: "600",
    fontSize: "14px",
  },

  resetBtn: {
    padding: "14px 24px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--line)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--ink)",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default Settings;

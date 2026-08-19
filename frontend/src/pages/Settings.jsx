import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { AlertCircle, Camera as CameraIcon, Check, Ruler, Sparkles } from "lucide-react";

const MotionDiv = motion.div;
const EASTER_EGG_KEY = "fitsense_settings_easter_egg_seen";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { estimateTargets } from "../lib/targets";
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from "../lib/units";
import { reduceMotion } from "../lib/motion";
import AmbientGlow from "../components/AmbientGlow";

// Minimal egg silhouette for the scroll-to-bottom reveal — narrow rounded
// top, fuller rounded bottom, no illustrative detail. Fill/stroke reuse the
// same translucent-oxblood-fill-plus-outline language as iconCircle/badge
// elsewhere, so it reads as native chrome rather than a one-off graphic.
function EggIcon() {
  return (
    <svg width="44" height="55" viewBox="0 0 64 80" fill="none" aria-hidden="true">
      <path
        d="M32,4 C46,4 58,28 58,50 C58,68 46,78 32,78 C18,78 6,68 6,50 C6,28 18,4 32,4 Z"
        style={{
          fill: "rgba(var(--oxblood-rgb), 0.12)",
          stroke: "var(--oxblood)",
          strokeWidth: 1.75,
        }}
      />
    </svg>
  );
}

// Own small SVG (not a path nested inside EggIcon's viewBox) so its scale
// animation transforms from its own center — a nested path would instead
// scale from the parent viewBox's origin without extra transform-origin
// plumbing.
function HeartIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 32 28" fill="none" aria-hidden="true">
      <path
        d="M16,28 C16,28 0,17 0,8 C0,3.58 3.58,0 8,0 C11.5,0 14.5,2 16,5 C17.5,2 20.5,0 24,0 C28.42,0 32,3.58 32,8 C32,17 16,28 16,28 Z"
        style={{
          fill: "rgba(var(--oxblood-rgb), 0.12)",
          stroke: "var(--oxblood)",
          strokeWidth: 2,
        }}
      />
    </svg>
  );
}

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

// Display-only imperial state, derived from the canonical metric fields —
// only recomputed at load/discard/toggle time, never on every render (that
// would reformat the input mid-keystroke and fight the user's typing).
function imperialFromMetric(heightCm, weightKg) {
  const { feet, inches } = cmToFeetInches(heightCm);
  return { heightFeet: feet, heightInches: inches, weightLb: kgToLb(weightKg) };
}

function Settings() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState(() => fieldsFromUser(user));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Checked once — a genuine one-time reveal, not re-shown on later visits
  // once localStorage records it's already been seen.
  const [easterEggAlreadySeen] = useState(() => localStorage.getItem(EASTER_EGG_KEY) === "true");

  const [units, setUnits] = useState(() => localStorage.getItem("fitsense_units") || "metric");
  const [imperial, setImperial] = useState(() => imperialFromMetric(fields.height, fields.weight));

  useEffect(() => {
    localStorage.setItem("fitsense_units", units);
  }, [units]);

  const toggleUnits = () => {
    setUnits((prev) => {
      const next = prev === "metric" ? "imperial" : "metric";
      if (next === "imperial") {
        // Re-derive from the current canonical metric value so the display
        // never shows anything stale from before the last toggle.
        setImperial(imperialFromMetric(fields.height, fields.weight));
      }
      return next;
    });
  };

  const setField = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const setHeightImperial = (part) => (e) => {
    const value = e.target.value;
    setImperial((prev) => {
      const next = { ...prev, [part]: value };
      setFields((f) => ({ ...f, height: feetInchesToCm(next.heightFeet, next.heightInches) }));
      return next;
    });
  };

  const setWeightImperial = (e) => {
    const value = e.target.value;
    setImperial((prev) => ({ ...prev, weightLb: value }));
    setFields((prev) => ({ ...prev, weight: lbToKg(value) }));
  };

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
      setTimeout(() => navigate("/"), 700);
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
    const reset = fieldsFromUser(user);
    setFields(reset);
    setImperial(imperialFromMetric(reset.height, reset.weight));
    setStatus(null);
  };

  const [cameraTestPhoto, setCameraTestPhoto] = useState(null);
  const [cameraTestError, setCameraTestError] = useState(null);

  const testCameraAccess = async () => {
    setCameraTestError(null);
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: 70,
      });
      setCameraTestPhoto(photo.webPath);
    } catch (err) {
      setCameraTestError(err?.message || "Camera access was denied or cancelled.");
    }
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

        <div style={styles.sectionHeaderRow}>
          <h3 style={{ ...styles.sectionTitle, marginTop: 0 }}>Profile</h3>
          <button type="button" style={styles.unitsToggleBtn} onClick={toggleUnits}>
            <Ruler size={14} strokeWidth={2.5} />
            {units === "metric" ? "Switch to lb / ft+in" : "Switch to kg / cm"}
          </button>
        </div>

        <div style={styles.grid}>
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Name</label>
            <input style={styles.input} value={fields.name} onChange={setField("name")} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Age</label>
            <input style={styles.input} value={fields.age} onChange={setField("age")} />
          </div>

          {units === "metric" ? (
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Height (cm)</label>
              <input style={styles.input} value={fields.height} onChange={setField("height")} />
            </div>
          ) : (
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Height (ft + in)</label>
              <div style={styles.compoundInputRow}>
                <input
                  style={{ ...styles.input, flex: 1, minWidth: 0 }}
                  placeholder="ft"
                  value={imperial.heightFeet}
                  onChange={setHeightImperial("heightFeet")}
                />
                <input
                  style={{ ...styles.input, flex: 1, minWidth: 0 }}
                  placeholder="in"
                  value={imperial.heightInches}
                  onChange={setHeightImperial("heightInches")}
                />
              </div>
            </div>
          )}

          {units === "metric" ? (
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Weight (kg)</label>
              <input style={styles.input} value={fields.weight} onChange={setField("weight")} />
            </div>
          ) : (
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>Weight (lb)</label>
              <input style={styles.input} value={imperial.weightLb} onChange={setWeightImperial} />
            </div>
          )}

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
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Daily Calories</label>
            <input style={styles.input} value={fields.calorieTarget} onChange={setField("calorieTarget")} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Protein Goal (g)</label>
            <input style={styles.input} value={fields.proteinTarget} onChange={setField("proteinTarget")} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Carb Goal (g)</label>
            <input style={styles.input} value={fields.carbTarget} onChange={setField("carbTarget")} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Fat Goal (g)</label>
            <input style={styles.input} value={fields.fatTarget} onChange={setField("fatTarget")} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Water Goal (L)</label>
            <input style={styles.input} value={fields.waterTarget} onChange={setField("waterTarget")} />
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.saveBtn} onClick={saveSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button style={styles.resetBtn} onClick={discardChanges}>
            Discard Changes
          </button>
        </div>

        {Capacitor.isNativePlatform() && (
          <div style={styles.devSection}>
            <h3 style={styles.devSectionTitle}>Dev: Camera Permission Check</h3>
            <p style={styles.devSectionNote}>
              Temporary — confirms the camera/photo-library permission prompts fire
              correctly on-device. Remove once the real meal-scanning feature ships.
            </p>

            <button style={styles.devBtn} onClick={testCameraAccess} type="button">
              <CameraIcon size={16} strokeWidth={2.5} /> Test Camera Access
            </button>

            {cameraTestError && (
              <div style={styles.errorBanner}>
                <AlertCircle size={17} strokeWidth={2.5} />
                {cameraTestError}
              </div>
            )}

            {cameraTestPhoto && (
              <img src={cameraTestPhoto} alt="Camera test capture" style={styles.devPhotoPreview} />
            )}
          </div>
        )}

        {!easterEggAlreadySeen && (
          <MotionDiv
            style={styles.easterEgg}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            onViewportEnter={() => localStorage.setItem(EASTER_EGG_KEY, "true")}
          >
            <div style={styles.easterEggGlowWrap}>
              <AmbientGlow active />
              <MotionDiv
                style={styles.easterEggIconWrap}
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.035, 1] }}
                transition={
                  reduceMotion
                    ? { duration: 0.3 }
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <EggIcon />
              </MotionDiv>
              <MotionDiv
                style={styles.easterEggHeartWrap}
                animate={reduceMotion ? { scale: 1 } : { scale: [1, 1.15, 1] }}
                transition={
                  reduceMotion
                    ? { duration: 0.3 }
                    : {
                        duration: 0.8,
                        repeat: Infinity,
                        times: [0, 0.25, 1],
                        ease: ["easeOut", "easeInOut"],
                      }
                }
              >
                <HeartIcon />
              </MotionDiv>
            </div>
            <p style={styles.easterEggText}>You made it to the bottom. Not everyone does.</p>
          </MotionDiv>
        )}
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

  sectionHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "24px",
    marginBottom: "14px",
  },

  unitsToggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 16px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--line)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    background: "var(--paper-raised)",
    color: "var(--ink)",
    transition: "border-color var(--duration-hover) ease, transform var(--duration-hover) var(--ease-out)",
  },

  compoundInputRow: {
    display: "flex",
    gap: "8px",
  },

 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
},
fieldGroup: {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
},
fieldLabel: {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--graphite)",
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
  // >=16px: iOS auto-zooms the page on focus below that, regardless of
  // user-scalable=no (unreliable for this specific behavior on WebKit).
  fontSize: "16px",
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

  // Quiet, understated on purpose — a reward for the attentive few, not an
  // alert or a call to action. Unboxed (no card/pill chrome) so it reads as
  // a discovered moment rather than another UI element on the page.
  easterEgg: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "36px",
  },

  // Sized larger than the egg itself so AmbientGlow's halo has room to
  // breathe around it instead of clipping tight to the icon's edges.
  easterEggGlowWrap: {
    position: "relative",
    width: "88px",
    height: "88px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // The proven stacking fix — without an explicit position/zIndex here the
  // egg paints under AmbientGlow's positioned z-index:0 layer instead of
  // over it.
  easterEggIconWrap: {
    position: "relative",
    zIndex: 1,
    display: "flex",
  },

  // Fixed-position overlay (not a flex sibling) so it sits on top of the
  // egg rather than beside it — nudged down from dead-center into the
  // egg's fuller lower half, where the shape actually has the room.
  easterEggHeartWrap: {
    position: "absolute",
    width: "18px",
    height: "16px",
    left: "35px",
    top: "42px",
    zIndex: 2,
  },

  easterEggText: {
    margin: 0,
    color: "var(--graphite)",
    fontSize: "13px",
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

  devSection: {
    marginTop: "28px",
    paddingTop: "24px",
    borderTop: "1px dashed var(--line)",
  },

  devSectionTitle: {
    margin: "0 0 6px",
    fontSize: "15px",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--graphite)",
  },

  devSectionNote: {
    margin: "0 0 14px",
    fontSize: "13px",
    color: "var(--graphite)",
  },

  devBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 18px",
    borderRadius: "var(--radius-full)",
    border: "1px dashed var(--line)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },

  devPhotoPreview: {
    display: "block",
    marginTop: "14px",
    maxWidth: "220px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
  },
};

export default Settings;

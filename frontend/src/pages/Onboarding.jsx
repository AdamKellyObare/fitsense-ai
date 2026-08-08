import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Camera, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { estimateTargets } from "../lib/targets";
import { useViewport } from "../hooks/useViewport";
import { getOnboardingStyles } from "./onboardingStyles";

const MotionDiv = motion.div;

const STEP_KEYS = ["welcome1", "welcome2", "goal", "age", "height", "weight", "activity", "closing"];

const GOALS = [
  { value: "cutting", label: "Cutting", desc: "Lose fat while preserving muscle" },
  { value: "maintenance", label: "Maintenance", desc: "Stay at your current weight" },
  { value: "bulking", label: "Bulking", desc: "Build muscle with a calorie surplus" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { value: "light", label: "Light", desc: "1-3 days a week" },
  { value: "moderate", label: "Moderate", desc: "3-5 days a week" },
  { value: "active", label: "Active", desc: "6-7 days a week" },
  { value: "very_active", label: "Very active", desc: "Physical job or daily training" },
];

const slideVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

function OptionList({ options, value, onSelect, styles }) {
  return (
    <div style={styles.optionGrid}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          style={{
            ...styles.optionCard,
            ...(value === opt.value ? styles.optionCardSelected : {}),
          }}
        >
          <div style={styles.optionCardTitle}>{opt.label}</div>
          <div style={styles.optionCardDesc}>{opt.desc}</div>
        </button>
      ))}
    </div>
  );
}

function NumericStep({ suffix, value, onChange, styles }) {
  return (
    <div style={styles.numericInputWrap}>
      <input
        type="number"
        inputMode="decimal"
        placeholder={suffix}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.numericInput}
        autoFocus
      />
    </div>
  );
}

function Onboarding() {
  const { isMobile } = useViewport();
  const styles = getOnboardingStyles(isMobile);
  const { updateProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("maintenance");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const stepKey = STEP_KEYS[step];
  const goNext = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setSubmitting(true);
    setError("");

    const parsedAge = age === "" ? null : Number(age);
    const parsedHeight = height === "" ? null : Number(height);
    const parsedWeight = weight === "" ? null : Number(weight);

    const targets = estimateTargets({
      age: parsedAge,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      goal,
      activityLevel,
    });

    try {
      await updateProfile({
        age: parsedAge,
        height_cm: parsedHeight,
        weight_kg: parsedWeight,
        activity_level: activityLevel,
        goal,
        has_onboarded: true,
        ...(targets
          ? {
              calorie_target: targets.calorie_target,
              protein_target: targets.protein_target,
              carb_target: targets.carb_target,
              fat_target: targets.fat_target,
            }
          : {}),
      });
      // No navigation needed: App.jsx's gate stops rendering Onboarding as
      // soon as user.has_onboarded flips true in AuthContext state.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (stepKey) {
      case "welcome1":
        return (
          <div style={styles.card}>
            <div style={styles.iconCircle}>
              <Sparkles size={28} strokeWidth={2.2} />
            </div>
            <div style={styles.badge}>Welcome</div>
            <h1 style={styles.title}>Smarter calorie tracking, powered by AI</h1>
            <p style={styles.bodyText}>
              Describe what you ate in plain language and FitSense AI estimates
              the calories and macros for you — no manual lookup, no barcode
              scanning.
            </p>
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
          </div>
        );

      case "welcome2":
        return (
          <div style={styles.card}>
            <div style={styles.iconCircle}>
              <Camera size={28} strokeWidth={2.2} />
            </div>
            <h1 style={styles.title}>A real photo for every meal</h1>
            <p style={styles.bodyText}>
              Every meal you log gets a matching photo, so your history reads
              like a food diary — not a spreadsheet.
            </p>
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
          </div>
        );

      case "goal":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>What's your goal?</h1>
            <p style={styles.bodyText}>This shapes your daily calorie and macro targets.</p>
            <OptionList options={GOALS} value={goal} onSelect={setGoal} styles={styles} />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
          </div>
        );

      case "age":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>How old are you?</h1>
            <p style={styles.bodyText}>Used to estimate your daily calorie needs.</p>
            <NumericStep suffix="Age" value={age} onChange={setAge} styles={styles} />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
            <button style={styles.skipLink} onClick={goNext}>
              Skip this question
            </button>
          </div>
        );

      case "height":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>What's your height?</h1>
            <p style={styles.bodyText}>In centimeters.</p>
            <NumericStep suffix="cm" value={height} onChange={setHeight} styles={styles} />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
            <button style={styles.skipLink} onClick={goNext}>
              Skip this question
            </button>
          </div>
        );

      case "weight":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>What's your weight?</h1>
            <p style={styles.bodyText}>In kilograms.</p>
            <NumericStep suffix="kg" value={weight} onChange={setWeight} styles={styles} />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
            <button style={styles.skipLink} onClick={goNext}>
              Skip this question
            </button>
          </div>
        );

      case "activity":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>How active are you?</h1>
            <p style={styles.bodyText}>Used to fine-tune your calorie target.</p>
            <OptionList
              options={ACTIVITY_LEVELS}
              value={activityLevel}
              onSelect={setActivityLevel}
              styles={styles}
            />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
          </div>
        );

      case "closing":
      default:
        return (
          <div style={styles.card}>
            <div style={styles.iconCircle}>
              <CheckCircle2 size={28} strokeWidth={2.2} />
            </div>
            <h1 style={styles.title}>You're all set</h1>
            <p style={styles.bodyText}>
              Your dashboard is personalized and ready. Log your first meal
              whenever you're ready — FitSense AI will take it from there.
            </p>
            <button
              style={{
                ...styles.primaryButton,
                ...(submitting ? styles.primaryButtonDisabled : {}),
              }}
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? (
                "Setting up..."
              ) : (
                <>
                  <Flame size={16} strokeWidth={2.6} style={{ marginRight: "6px", verticalAlign: "-3px" }} />
                  Enter Dashboard
                </>
              )}
            </button>
            {error && <div style={styles.errorBox}>{error}</div>}
          </div>
        );
    }
  };

  return (
    <div style={styles.page}>
      {step > 0 && (
        <button style={styles.backLink} onClick={goBack}>
          <ArrowLeft size={15} strokeWidth={2.4} />
          Back
        </button>
      )}

      <div style={styles.progressRow}>
        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            style={{
              ...styles.progressDot,
              ...(i === step ? styles.progressDotActive : {}),
              ...(i < step ? styles.progressDotDone : {}),
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv
          key={stepKey}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderStep()}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}

export default Onboarding;

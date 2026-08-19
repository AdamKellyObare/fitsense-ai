import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Beef, Camera, CheckCircle2, Droplets, Flame, Sparkles, Wheat } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { estimateTargets } from "../lib/targets";
import { useViewport } from "../hooks/useViewport";
import { getOnboardingStyles } from "./onboardingStyles";
import AmbientGlow from "../components/AmbientGlow";

const MotionDiv = motion.div;

const STEP_KEYS = [
  "welcome1",
  "welcome2",
  "goal",
  "age",
  "sex",
  "height",
  "weight",
  "activity",
  "building",
  "closing",
];

// Steps where submission has already started (or completed) — going back
// would mean re-triggering a save mid-flight, not worth building for.
const NO_BACK_STEPS = new Set(["building", "closing"]);

const GOALS = [
  { value: "cutting", label: "Cutting", desc: "Lose fat while preserving muscle" },
  { value: "maintenance", label: "Maintenance", desc: "Stay at your current weight" },
  { value: "bulking", label: "Bulking", desc: "Build muscle with a calorie surplus" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Male", desc: "" },
  { value: "female", label: "Female", desc: "" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
  { value: "light", label: "Light", desc: "1-3 days a week" },
  { value: "moderate", label: "Moderate", desc: "3-5 days a week" },
  { value: "active", label: "Active", desc: "6-7 days a week" },
  { value: "very_active", label: "Very active", desc: "Physical job or daily training" },
];

const LOADING_MESSAGES = [
  "Calculating your metabolic rate...",
  "Factoring in your activity level...",
  "Balancing your macros...",
  "Putting it all together...",
];

const BUILDING_MIN_MS = 2800;
const MESSAGE_INTERVAL_MS = 700;

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
          {opt.desc && <div style={styles.optionCardDesc}>{opt.desc}</div>}
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
  const { user, updateProfile } = useAuth();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("maintenance");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [error, setError] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");

  const stepKey = STEP_KEYS[step];
  const goNext = () => setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const wasPersonalized = age !== "" && height !== "" && weight !== "";

  const runSubmission = async () => {
    setError("");

    const parsedAge = age === "" ? null : Number(age);
    const parsedHeight = height === "" ? null : Number(height);
    const parsedWeight = weight === "" ? null : Number(weight);

    const targets = estimateTargets({
      age: parsedAge,
      sex: sex || undefined,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      goal,
      activityLevel,
    });

    const minDelay = new Promise((resolve) => setTimeout(resolve, BUILDING_MIN_MS));

    // Deliberately does NOT set has_onboarded yet — App.jsx's gate reacts to
    // that flag the instant it flips, which would unmount this whole flow
    // mid-"building" and skip the reveal screen entirely. has_onboarded is
    // set by a separate, final call when "Enter Dashboard" is actually
    // clicked (see finishOnboarding below).
    const submission = updateProfile({
      age: parsedAge,
      sex: sex || null,
      height_cm: parsedHeight,
      weight_kg: parsedWeight,
      activity_level: activityLevel,
      goal,
      ...(targets
        ? {
            calorie_target: targets.calorie_target,
            protein_target: targets.protein_target,
            carb_target: targets.carb_target,
            fat_target: targets.fat_target,
          }
        : {}),
    })
      .then(() => true)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
        return false;
      });

    const [, success] = await Promise.all([minDelay, submission]);
    return success;
  };

  // Separate final call, triggered by clicking "Enter Dashboard" on the
  // reveal — this is what actually flips has_onboarded and lets App.jsx's
  // gate take over, at the moment the user chooses to leave, not the moment
  // the background save happens to finish.
  const finishOnboarding = async () => {
    setFinishing(true);
    setFinishError("");
    try {
      await updateProfile({ has_onboarded: true });
    } catch (err) {
      setFinishError(err instanceof ApiError ? err.message : "Something went wrong — please try again.");
      setFinishing(false);
    }
  };

  // Auto-runs the real submission while the "building" step is showing —
  // the reassuring copy and the actual save happen concurrently, so a fast
  // network still gets the earned-not-instant moment and a slow one isn't
  // cut short. Doesn't advance on failure — error + Retry stay on this step.
  useEffect(() => {
    if (stepKey !== "building") return;

    let cancelled = false;
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);

    runSubmission().then((success) => {
      if (cancelled) return;
      clearInterval(messageInterval);
      if (success) goNext();
    });

    return () => {
      cancelled = true;
      clearInterval(messageInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, retryCount]);

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
            <p style={styles.bodyText}>
              Your goal determines how we calculate your calorie target — a
              deficit for cutting, a surplus for bulking, or a steady
              baseline for maintenance. You can always change this later in
              Settings.
            </p>
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
            <p style={styles.bodyText}>
              Age affects your metabolic rate — it's one of the four inputs
              we use to calculate your baseline calorie needs.
            </p>
            <NumericStep suffix="Age" value={age} onChange={setAge} styles={styles} />
            <button style={styles.primaryButton} onClick={goNext}>
              Continue
            </button>
            <button style={styles.skipLink} onClick={goNext}>
              Skip this question
            </button>
          </div>
        );

      case "sex":
        return (
          <div style={styles.card}>
            <h1 style={styles.title}>What's your sex?</h1>
            <p style={styles.bodyText}>
              This affects your baseline metabolic rate, so it factors into
              your calorie calculation. Prefer not to say? Skip it — we'll
              use an averaged estimate instead.
            </p>
            <OptionList options={SEX_OPTIONS} value={sex} onSelect={setSex} styles={styles} />
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
            <p style={styles.bodyText}>
              In centimeters — this factors into your calorie calculation too.
            </p>
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
            <p style={styles.bodyText}>
              In kilograms. Combined with your height, this helps us
              estimate your energy needs.
            </p>
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
            <p style={styles.bodyText}>
              Your activity level adjusts your target to match how much
              energy you actually burn day to day — the more active you
              are, the more fuel your body needs.
            </p>
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

      case "building":
        return (
          <div style={{ ...styles.card, position: "relative" }}>
            <AmbientGlow active />
            <div style={styles.aiWaitContent}>
              <div style={styles.iconCircle}>
                <Sparkles size={28} strokeWidth={2.2} />
              </div>
              <h1 style={styles.title}>Building your plan</h1>
              <p style={styles.bodyText}>{LOADING_MESSAGES[loadingMessageIndex]}</p>

              {error && (
                <>
                  <div style={styles.errorBox}>{error}</div>
                  <button
                    style={{ ...styles.primaryButton, marginTop: "16px" }}
                    onClick={() => setRetryCount((c) => c + 1)}
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case "closing":
      default: {
        const calorieTarget = user?.calorie_target ?? 2000;
        const proteinTarget = user?.protein_target ?? 180;
        const carbTarget = user?.carb_target ?? 200;
        const fatTarget = user?.fat_target ?? 65;

        return (
          <div style={styles.card}>
            <div style={styles.iconCircle}>
              <CheckCircle2 size={28} strokeWidth={2.2} />
            </div>
            <h1 style={styles.title}>Your plan is ready</h1>

            <div style={styles.revealHero}>
              <span style={styles.revealHeroValue}>{calorieTarget.toLocaleString()}</span>
              <span style={styles.revealHeroUnit}>kcal/day</span>
            </div>

            <div style={styles.revealStatsRow}>
              <div style={styles.revealStat}>
                <Beef size={16} strokeWidth={2.4} />
                <span>{proteinTarget}g protein</span>
              </div>
              <div style={styles.revealStat}>
                <Wheat size={16} strokeWidth={2.4} />
                <span>{carbTarget}g carbs</span>
              </div>
              <div style={styles.revealStat}>
                <Droplets size={16} strokeWidth={2.4} />
                <span>{fatTarget}g fat</span>
              </div>
            </div>

            <p style={styles.bodyText}>
              {wasPersonalized
                ? "This is your starting point — fine-tune it anytime in Settings."
                : "We don't have enough info yet to personalize this — here are sensible starting defaults. Add your details in Settings anytime for a real calculation."}
            </p>

            <button
              style={{ ...styles.primaryButton, ...(finishing ? styles.primaryButtonDisabled : {}) }}
              onClick={finishOnboarding}
              disabled={finishing}
            >
              {finishing ? (
                "Finishing up..."
              ) : (
                <>
                  <Flame size={16} strokeWidth={2.6} style={{ marginRight: "6px", verticalAlign: "-3px" }} />
                  Enter Dashboard
                </>
              )}
            </button>
            {finishError && <div style={styles.errorBox}>{finishError}</div>}
          </div>
        );
      }
    }
  };

  return (
    <div style={styles.page}>
      {step > 0 && !NO_BACK_STEPS.has(stepKey) && (
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

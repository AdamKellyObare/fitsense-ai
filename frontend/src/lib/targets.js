const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENT = {
  cutting: 0.8,
  maintenance: 1,
  bulking: 1.15,
};

const GOAL_PROTEIN_PER_KG = {
  cutting: 2.2,
  maintenance: 2.0,
  bulking: 1.8,
};

// Mifflin-St Jeor. Sex is optional (used only for the +5/-161 constant); if
// omitted, we average the two so the calculator still works without forcing
// anyone to disclose it.
function estimateBMR({ age, sex, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  return base - 78; // average of +5 and -161
}

export function estimateTargets({ age, sex, heightCm, weightKg, goal, activityLevel }) {
  if (!age || !heightCm || !weightKg) return null;

  const bmr = estimateBMR({ age, sex, heightCm, weightKg });
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate);
  const calorieTarget = Math.round(tdee * (GOAL_CALORIE_ADJUSTMENT[goal] ?? 1));

  const proteinTarget = Math.round(weightKg * (GOAL_PROTEIN_PER_KG[goal] ?? GOAL_PROTEIN_PER_KG.maintenance));
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);
  const remainingCalories = Math.max(calorieTarget - proteinTarget * 4 - fatTarget * 9, 0);
  const carbTarget = Math.round(remainingCalories / 4);

  return {
    calorie_target: calorieTarget,
    protein_target: proteinTarget,
    carb_target: carbTarget,
    fat_target: fatTarget,
  };
}

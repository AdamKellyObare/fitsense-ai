// Shared across every ambient/pulse animation in the app (MealPhoto's
// pending overlay, Onboarding's "building" icon, AmbientGlow) — computed
// once at module load, not per-render, since it can't change without a page
// reload anyway.
export const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

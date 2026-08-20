// Weight entries are expected sorted ascending by logged_date, each shaped
// like { logged_date: "2026-08-19", weight_kg: 81.4 } (matches
// WeightEntryPublic, serialized).

const TREND_ALPHA = 0.15; // new entry's weight in the running trend
const RATE_WINDOW_DAYS = 28;
const RATE_MIN_ENTRIES = 7;
const STABLE_RATE_KG_PER_WEEK = 0.05;

function daysBetween(a, b) {
  return (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24);
}

// Exponential moving average over the ordered raw entries — smooths out
// single-day fluctuation (water, food volume, etc.) without needing a fixed
// window, and keeps responding to a real, sustained change within roughly
// 1-2 weeks. Entries are consumed in order; a gap between calendar days
// isn't itself weighted (see the plan) — this is the simplification called
// out up front, not an oversight.
export function withTrend(entries) {
  let trend = null;
  return entries.map((entry) => {
    trend = trend === null ? entry.weight_kg : TREND_ALPHA * entry.weight_kg + (1 - TREND_ALPHA) * trend;
    return { ...entry, trend };
  });
}

// Least-squares linear regression of raw weight against day-offset, over
// the trailing RATE_WINDOW_DAYS — a slope, not a two-point delta, so one
// noisy weigh-in can't swing the number. Returns null (not a shaky number)
// below RATE_MIN_ENTRIES in that window.
export function calculateWeeklyRate(entries) {
  if (entries.length < 2) return null;

  const latestDate = entries[entries.length - 1].logged_date;
  const windowEntries = entries.filter(
    (e) => daysBetween(e.logged_date, latestDate) <= RATE_WINDOW_DAYS
  );

  if (windowEntries.length < RATE_MIN_ENTRIES) return null;

  const xs = windowEntries.map((e) => daysBetween(windowEntries[0].logged_date, e.logged_date));
  const ys = windowEntries.map((e) => e.weight_kg);
  const n = xs.length;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }

  if (den === 0) return 0;

  const slopePerDay = num / den;
  return slopePerDay * 7;
}

// null target => no projection at all. Otherwise one of a projected date,
// a "stable" read, a "wrong direction" read, or "already there".
export function projectGoal({ currentTrend, targetWeightKg, weeklyRateKg }) {
  if (targetWeightKg == null || currentTrend == null) return null;

  const remaining = targetWeightKg - currentTrend;
  if (Math.abs(remaining) < 0.1) {
    return { status: "reached" };
  }

  if (weeklyRateKg == null) {
    return { status: "insufficient-data" };
  }

  if (Math.abs(weeklyRateKg) < STABLE_RATE_KG_PER_WEEK) {
    return { status: "stable" };
  }

  // remaining and weeklyRateKg must share direction (both need to close the
  // gap the same way) for this to be real progress toward the goal.
  const movingTowardGoal = Math.sign(remaining) === Math.sign(weeklyRateKg);
  if (!movingTowardGoal) {
    return { status: "wrong-direction" };
  }

  const weeksRemaining = Math.abs(remaining / weeklyRateKg);
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + Math.round(weeksRemaining * 7));

  return { status: "projected", weeksRemaining, projectedDate };
}

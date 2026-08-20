import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Scale, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, weightApi } from "../lib/api";
import { localDateKey } from "../lib/dates";
import { kgToLb, lbToKg } from "../lib/units";
import { calculateWeeklyRate, projectGoal, withTrend } from "../lib/weightTrend";

const CHART_WINDOW_DAYS = 90;

function toDisplayUnit(kg, units) {
  if (kg == null) return null;
  return units === "imperial" ? Math.round(Number(kgToLb(kg)) * 10) / 10 : Math.round(kg * 10) / 10;
}

function formatWeight(kg, units) {
  const value = toDisplayUnit(kg, units);
  if (value == null) return "—";
  return `${value}`;
}

function formatSigned(kg, units) {
  const value = toDisplayUnit(kg, units);
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

function ChartTooltip({ active, payload, label, units }) {
  if (!active || !payload?.length) return null;
  const raw = payload.find((p) => p.dataKey === "raw")?.value;
  const trend = payload.find((p) => p.dataKey === "trend")?.value;
  const unitLabel = units === "imperial" ? "lb" : "kg";

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipLabel}>{label}</div>
      {raw != null && (
        <div style={styles.tooltipValue}>
          {raw} {unitLabel}
        </div>
      )}
      {trend != null && (
        <div style={styles.tooltipTrend}>
          trend {trend} {unitLabel}
        </div>
      )}
    </div>
  );
}

const GOAL_COPY = {
  reached: () => "You're at your goal weight.",
  "insufficient-data": () => "Log a few more entries to project a goal date.",
  stable: () => "Your weight's been stable recently — no clear trend toward your target yet.",
  "wrong-direction": () => "You're currently trending away from your target.",
};

function WeightTrend() {
  const { user, updateProfile } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState("");

  const units = useState(() => localStorage.getItem("fitsense_units") || "metric")[0];

  useEffect(() => {
    weightApi
      .list()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trended = useMemo(() => withTrend(entries), [entries]);
  const weeklyRate = useMemo(() => calculateWeeklyRate(entries), [entries]);

  const currentTrend = trended.length ? trended[trended.length - 1].trend : null;
  const startingWeight = entries.length ? entries[0].weight_kg : null;
  const totalChange = currentTrend != null && startingWeight != null ? currentTrend - startingWeight : null;

  const goal = useMemo(
    () => projectGoal({ currentTrend, targetWeightKg: user?.target_weight_kg, weeklyRateKg: weeklyRate }),
    [currentTrend, user?.target_weight_kg, weeklyRate]
  );

  const chartData = useMemo(() => {
    if (!trended.length) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CHART_WINDOW_DAYS);

    return trended
      .filter((e) => new Date(e.logged_date) >= cutoff)
      .map((e) => ({
        label: new Date(e.logged_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        raw: toDisplayUnit(e.weight_kg, units),
        trend: toDisplayUnit(e.trend, units),
      }));
  }, [trended, units]);

  const tickInterval = chartData.length > 12 ? Math.ceil(chartData.length / 8) : 0;

  const handleLog = async (e) => {
    e.preventDefault();
    const value = Number(inputValue);
    if (!value || value <= 0) return;

    const weightKg = units === "imperial" ? Number(lbToKg(value)) : value;

    setLogging(true);
    setError("");
    try {
      await weightApi.log(weightKg, localDateKey(new Date()));
      const fresh = await weightApi.list();
      setEntries(fresh);
      await updateProfile({ weight_kg: weightKg });
      setInputValue("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to log weight.");
    } finally {
      setLogging(false);
    }
  };

  const unitLabel = units === "imperial" ? "lb" : "kg";

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <h3 style={styles.sectionTitle}>Weight</h3>
          <p style={styles.sectionSubtitle}>Trend-smoothed, so day-to-day fluctuation doesn't hide the real picture.</p>
        </div>

        <form style={styles.logForm} onSubmit={handleLog}>
          <input
            style={styles.logInput}
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder={`Weight (${unitLabel})`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button style={styles.logBtn} type="submit" disabled={logging}>
            {logging ? "Logging…" : "Log"}
          </button>
        </form>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      {loading ? (
        <p style={styles.emptyText}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={styles.emptyText}>Log your first weigh-in above to start tracking your trend.</p>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>
                <Scale size={13} strokeWidth={2.5} /> Starting
              </p>
              <h2 style={styles.statValue}>
                {formatWeight(startingWeight, units)} <span style={styles.statUnit}>{unitLabel}</span>
              </h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Current (trend)</p>
              <h2 style={styles.statValue}>
                {formatWeight(currentTrend, units)} <span style={styles.statUnit}>{unitLabel}</span>
              </h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>
                {totalChange > 0 ? (
                  <TrendingUp size={13} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={13} strokeWidth={2.5} />
                )}{" "}
                Total change
              </p>
              <h2 style={styles.statValue}>
                {formatSigned(totalChange, units)} <span style={styles.statUnit}>{unitLabel}</span>
              </h2>
            </div>

            <div style={styles.statCard}>
              <p style={styles.statLabel}>Rate</p>
              <h2 style={styles.statValue}>
                {weeklyRate == null ? (
                  <span style={styles.statPlaceholder}>Not enough data</span>
                ) : (
                  <>
                    {formatSigned(weeklyRate, units)} <span style={styles.statUnit}>{unitLabel}/wk</span>
                  </>
                )}
              </h2>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="var(--graphite)"
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
                interval={tickInterval}
              />

              <YAxis
                stroke="var(--graphite)"
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
                domain={["dataMin - 1", "dataMax + 1"]}
              />

              <Tooltip content={<ChartTooltip units={units} />} cursor={{ stroke: "var(--line)" }} />

              {user?.target_weight_kg != null && (
                <ReferenceLine
                  y={toDisplayUnit(user.target_weight_kg, units)}
                  stroke="var(--graphite)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              )}

              <Scatter dataKey="raw" fill="var(--graphite)" fillOpacity={0.5} />

              <Line
                type="monotone"
                dataKey="trend"
                stroke="var(--oxblood)"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {goal && (
            <div style={styles.goalCard}>
              <h3 style={styles.goalTitle}>
                <Target size={15} strokeWidth={2.5} /> Goal Projection
              </h3>
              <p style={styles.goalText}>
                {goal.status === "projected"
                  ? `~${Math.round(goal.weeksRemaining)} week${Math.round(goal.weeksRemaining) === 1 ? "" : "s"} to reach your goal of ${formatWeight(user.target_weight_kg, units)} ${unitLabel} (around ${goal.projectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric" })}).`
                  : GOAL_COPY[goal.status]()}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    color: "var(--graphite)",
    fontSize: "13px",
  },

  logForm: {
    display: "flex",
    gap: "8px",
  },

  logInput: {
    width: "140px",
    padding: "10px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--line)",
    background: "var(--paper)",
    color: "var(--ink)",
    outline: "none",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  logBtn: {
    padding: "10px 18px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    background: "var(--oxblood)",
    color: "#f5efe8",
    fontWeight: "600",
    fontSize: "14px",
  },

  errorBanner: {
    marginBottom: "16px",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(var(--oxblood-rgb), 0.1)",
    color: "var(--oxblood)",
    fontSize: "13px",
  },

  emptyText: {
    color: "var(--graphite)",
    fontSize: "14px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  statCard: {
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    background: "var(--paper)",
    border: "1px solid var(--line)",
  },

  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--graphite)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    margin: 0,
  },

  statValue: {
    fontFamily: "var(--font-display)",
    fontWeight: "700",
    fontSize: "22px",
    color: "var(--ink)",
    marginTop: "8px",
    marginBottom: 0,
  },

  statUnit: {
    fontFamily: "var(--font-mono)",
    fontWeight: "500",
    fontSize: "13px",
    color: "var(--graphite)",
  },

  statPlaceholder: {
    fontFamily: "var(--font-body)",
    fontWeight: "500",
    fontSize: "14px",
    color: "var(--graphite)",
  },

  goalCard: {
    marginTop: "20px",
    padding: "18px 20px",
    borderRadius: "var(--radius-lg)",
    background: "var(--paper)",
    border: "1px solid var(--line)",
  },

  goalTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    fontSize: "14px",
    color: "var(--ink)",
  },

  goalText: {
    margin: "8px 0 0",
    color: "var(--graphite)",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  tooltip: {
    background: "var(--paper-raised)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 12px",
    boxShadow: "var(--shadow)",
  },

  tooltipLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--graphite)",
    marginBottom: "3px",
  },

  tooltipValue: {
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: "13px",
    color: "var(--ink)",
  },

  tooltipTrend: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--oxblood)",
  },
};

export default WeightTrend;

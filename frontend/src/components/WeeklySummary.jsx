import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { localDateKey } from "../lib/dates";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipLabel}>{label}</div>
      <div style={styles.tooltipValue}>{payload[0].value} kcal</div>
    </div>
  );
}

function WeeklySummary({ meals, calorieTarget }) {
  // get last 7 days
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { key: localDateKey(d), label: d.toDateString().slice(0, 3) };
  }).reverse();

  // build chart data
  const data = days.map(({ key, label }) => {
    const total = meals
      .filter(meal => localDateKey(meal.timestamp) === key)
      .reduce((sum, meal) => sum + (meal.calories || 0), 0);

    return {
      day: label,
      calories: total,
    };
  });

  return (
    <div style={{ marginTop: "10px" }}>
      <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Weekly Calories</h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />

          <XAxis
            dataKey="day"
            stroke="var(--graphite)"
            tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
          />

          <YAxis
            stroke="var(--graphite)"
            tick={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
          />

          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(var(--oxblood-rgb), 0.08)" }} />

          {calorieTarget > 0 && (
            <ReferenceLine
              y={calorieTarget}
              stroke="var(--graphite)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          )}

          <Bar
            dataKey="calories"
            fill="var(--oxblood)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
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
};

export default WeeklySummary;

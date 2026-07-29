import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipLabel}>{label}</div>
      <div style={styles.tooltipValue}>{payload[0].value} kcal</div>
    </div>
  );
}

function WeeklySummary({ meals }) {
  // get last 7 days
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  // build chart data
  const data = days.map(day => {
    const total = meals
      .filter(meal => new Date(meal.timestamp).toDateString() === day)
      .reduce((sum, meal) => sum + (meal.calories || 0), 0);

    return {
      day: day.slice(0, 3),
      calories: total,
    };
  });

  return (
    <div style={{ marginTop: "10px" }}>
      <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Weekly Calories</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />

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

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line)" }} />

          <Line
            type="monotone"
            dataKey="calories"
            stroke="var(--oxblood)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--oxblood)", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "var(--oxblood)", strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </LineChart>
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

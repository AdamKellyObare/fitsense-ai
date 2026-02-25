import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

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
      <h3 style={{ marginBottom: "10px" }}>Weekly Calories</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

          <XAxis
            dataKey="day"
            stroke="#ccc"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            stroke="#ccc"
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="calories"
            stroke="#00ff87"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
            animationDuration={4000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklySummary;

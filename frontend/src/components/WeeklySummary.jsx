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
      day: day.slice(0, 3), // Mon Tue Wed
      calories: total,
    };
  });

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Weekly Calories</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#22c55e"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklySummary;

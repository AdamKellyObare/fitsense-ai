import { useState } from "react";

function App() {
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/estimate-calories/?food=${encodeURIComponent(food)}`
      );
      const data = await res.json();
      setCalories(data.calories);
    } catch (err) {
      console.error(err);
      setCalories("Error fetching calories");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>FitSense AI</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter food description"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem" }}>
          Estimate Calories
        </button>
      </form>
      {calories && (
        <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
          Estimated Calories: {calories}
        </p>
      )}
    </div>
  );
}

export default App;

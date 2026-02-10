function GoalSelector({ goal, setGoal }) {
  return (
    <select
      value={goal}
      onChange={(e) => setGoal(e.target.value)}
      style={styles.select}
    >
      <option value="cutting">Cutting (Fat loss)</option>
      <option value="maintenance">Maintenance</option>
      <option value="bulking">Bulking (Muscle gain)</option>
    </select>
  );
}

const styles = {
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "15px",
  },
};

export default GoalSelector;

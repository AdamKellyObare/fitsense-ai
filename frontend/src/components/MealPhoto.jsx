import AmbientGlow from "./AmbientGlow";

// The AI-generated photo (see backend/services/photo_generator.py) finishes
// after the meal is already logged — until photo_status is "ready", this
// shows the same stock placeholder photo_matcher.js always has, with the
// shared ambient glow so the eventual swap reads as intentional, not a
// flicker.
function MealPhoto({ meal, style }) {
  const src =
    meal.photo_status === "ready" && meal.generated_photo_url
      ? meal.generated_photo_url
      : `/food/${meal.photo_key || "generic-1"}.jpg`;

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      <img src={src} alt={meal.food} style={styles.img} />
      <AmbientGlow active={meal.photo_status === "pending"} />
    </div>
  );
}

const styles = {
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};

export default MealPhoto;

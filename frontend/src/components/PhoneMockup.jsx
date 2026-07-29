import { ArrowLeft, Beef, Droplet, Flame, MoreHorizontal, Signal, Sparkles, Target } from "lucide-react";

function Battery() {
  return (
    <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
      <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" />
      <rect x="2" y="2" width="15" height="7" rx="1.3" fill="currentColor" />
      <rect x="20" y="3.5" width="1.5" height="4" rx="0.7" fill="currentColor" />
    </svg>
  );
}

// Standard iOS status-bar wifi glyph: exactly 3 nested arcs, no base dot.
function WifiIcon() {
  return (
    <svg width="18" height="18" viewBox="-2 -2 28 28" fill="none">
      <path d="M2 8.82a15 15 0 0 1 20 0" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M5 12.859a10 10 0 0 1 14 0" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  );
}

function PhoneMockup({ styles }) {
  return (
    <div style={styles.loginRight}>
      <div style={styles.phoneFrame}>
        <div style={{ ...styles.phoneSideButton, left: "-2px", top: "118px", width: "4px", height: "28px", borderRadius: "3px 0 0 3px" }} />
        <div style={{ ...styles.phoneSideButton, left: "-2px", top: "168px", width: "4px", height: "48px", borderRadius: "3px 0 0 3px" }} />
        <div style={{ ...styles.phoneSideButton, left: "-2px", top: "224px", width: "4px", height: "48px", borderRadius: "3px 0 0 3px" }} />
        <div style={{ ...styles.phoneSideButton, right: "-2px", top: "190px", width: "4px", height: "70px", borderRadius: "0 3px 3px 0" }} />

        <div style={styles.phoneScreen}>
          <div style={styles.statusRow}>
            <span>9:41</span>
            <div style={styles.statusIcons}>
              <Signal size={15} strokeWidth={2.4} />
              <WifiIcon />
              <Battery />
            </div>
          </div>

          <div style={styles.island} />

          <div style={styles.screenScroll}>
            <div style={styles.heroImageWrap}>
              <img
                src="/marketing/meal-preview.jpg"
                alt="Stacked pancakes with banana, almonds, and maple syrup"
                style={styles.mealImage}
              />

              <div style={styles.heroHeaderRow}>
                <button style={styles.iconCircle}>
                  <ArrowLeft size={16} strokeWidth={2.5} />
                </button>
                <button style={styles.iconCircle}>
                  <MoreHorizontal size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div style={{ ...styles.foodLabel, top: "108px", left: "16px" }}>Pancake stack · 520 kcal</div>
              <div style={{ ...styles.foodLabel, right: "16px", top: "160px" }}>Banana · 105 kcal</div>
              <div style={{ ...styles.foodLabel, left: "16px", top: "212px" }}>Almonds · 40 kcal</div>

              <div style={styles.heroFade} />
            </div>

            <div style={styles.previewStats}>
              <div style={styles.previewStat}>
                <Flame size={17} strokeWidth={2.5} />
                <div style={styles.previewStatLabel}>
                  <span style={styles.previewStatKey}>Calories</span>
                  <span style={styles.previewStatValue}>520 kcal</span>
                </div>
              </div>

              <div style={styles.previewStat}>
                <Beef size={17} strokeWidth={2.5} />
                <div style={styles.previewStatLabel}>
                  <span style={styles.previewStatKey}>Protein</span>
                  <span style={styles.previewStatValue}>17 g</span>
                </div>
              </div>

              <div style={styles.previewStat}>
                <Droplet size={17} strokeWidth={2.5} />
                <div style={styles.previewStatLabel}>
                  <span style={styles.previewStatKey}>Water</span>
                  <span style={styles.previewStatValue}>1.5 L</span>
                </div>
              </div>

              <div style={styles.previewStat}>
                <Target size={17} strokeWidth={2.5} />
                <div style={styles.previewStatLabel}>
                  <span style={styles.previewStatKey}>Goal</span>
                  <span style={styles.previewStatValue}>76%</span>
                </div>
              </div>
            </div>

            <div style={styles.aiPreview}>
              <Sparkles size={16} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>You are 480 kcal away from today's goal.</span>
            </div>

            <div style={styles.heroActions}>
              <button style={styles.heroActionGhost}>Fix Results</button>
              <button style={styles.heroActionPrimary}>Log Meal</button>
            </div>
          </div>

          <div style={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}

export default PhoneMockup;

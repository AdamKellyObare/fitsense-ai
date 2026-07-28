function PhoneMockup({ styles }) {
  return (
    <div style={styles.loginRight}>
      <div style={styles.phoneFrame}>
        <div style={styles.phoneScreen}>
          <div style={styles.phoneStatusBar}>
            <span style={styles.phoneTime}>9:41</span>

            <div style={styles.dynamicIsland}></div>

            <div style={styles.iosIcons}>
              <span style={styles.cellularIcon}>
                <span style={{ width: "3px", height: "4px", background: "white", borderRadius: "2px" }}></span>
                <span style={{ width: "3px", height: "6px", background: "white", borderRadius: "2px" }}></span>
                <span style={{ width: "3px", height: "8px", background: "white", borderRadius: "2px" }}></span>
                <span style={{ width: "3px", height: "10px", background: "white", borderRadius: "2px" }}></span>
              </span>

              <span style={styles.wifiSvg}>⌁</span>

              <span style={styles.batteryOuter}>
                <span style={styles.batteryInner}></span>
                <span style={styles.batteryCap}></span>
              </span>
            </div>
          </div>

          <div style={styles.phoneHeader}>
            <button style={styles.iconCircle}>←</button>
            <span style={styles.phoneTitle}>Scanner</span>
            <button style={styles.iconCircle}>•••</button>
          </div>

          <div style={styles.scanCard}>
            <div style={styles.scanCardTitle}>AI meal scan preview</div>

            <div style={styles.scanFrame}>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=90"
                alt="Healthy meal"
                style={styles.mealImage}
              />

              <div style={styles.scanOverlay}></div>

              <div style={styles.scanCornerTopLeft}></div>
              <div style={styles.scanCornerTopRight}></div>
              <div style={styles.scanCornerBottomLeft}></div>
              <div style={styles.scanCornerBottomRight}></div>

              <div style={styles.foodLabelOne}>Chicken bowl · 520 kcal</div>
              <div style={styles.foodLabelTwo}>Protein · 35 g</div>
              <div style={styles.foodLabelFour}>Vegetables · 90 kcal</div>
            </div>
          </div>

          <div style={styles.previewStats}>
            <div style={styles.previewStat}>
              <span>🔥 Calories</span>
              <strong>520 kcal</strong>
            </div>

            <div style={styles.previewStat}>
              <span>🥩 Protein</span>
              <strong>35 g</strong>
            </div>

            <div style={styles.previewStat}>
              <span>💧 Water</span>
              <strong>1.5 L</strong>
            </div>

            <div style={styles.previewStat}>
              <span>🎯 Goal</span>
              <strong>76%</strong>
            </div>
          </div>

          <div style={styles.aiPreview}>
            <strong>🤖 AI Coach</strong>
            <p>You are 480 kcal away from today's goal.</p>
          </div>

          <div style={styles.homeIndicator}></div>
        </div>
      </div>
    </div>
  );
}

export default PhoneMockup;

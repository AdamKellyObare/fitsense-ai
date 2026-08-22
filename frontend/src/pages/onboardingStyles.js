// Same deliberate, permanently-dark "Ledger" brand moment as authStyles.js —
// onboarding is the other high-impact first-impression screen a user sees,
// so it shares the same hardcoded palette rather than the app's themed
// --token custom properties.
const PAPER = "#13110d";
const PAPER_RAISED = "#1c1912";
const INK = "#f2f0e9";
const GRAPHITE = "#a39c8c";
const OXBLOOD = "#c1553c";
const OXBLOOD_STRONG = "#d66b4f";
const LINE = "#2a251c";

export const getOnboardingStyles = (isMobile) => ({
  page: {
    position: "fixed",
    // inset: 0 alone already fills the fixed positioning containing block
    // in both dimensions — explicit width/height are redundant, and were
    // set to 100vw/100vh, which mobile Safari's dynamic URL bar can
    // compute wider/taller than the actual visible screen. Just inset: 0
    // sidesteps the unit entirely rather than swapping to a "safer" one.
    inset: 0,
    background: PAPER,
    color: INK,
    fontFamily: "var(--font-body)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom))",
    boxSizing: "border-box",
    overflow: "auto",
  },

  progressRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "28px",
  },

  progressDot: {
    width: "22px",
    height: "4px",
    borderRadius: "var(--radius-full)",
    background: LINE,
    transition: "background var(--duration-hover) ease",
  },

  progressDotActive: {
    background: OXBLOOD,
  },

  progressDotDone: {
    background: GRAPHITE,
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  // Positioned content sitting above an AmbientGlow sibling (the "building"
  // step) — non-positioned content actually paints *before* a positioned
  // z-index:0 sibling in CSS stacking order, so without this the glow would
  // sit on top of the content instead of behind it.
  aiWaitContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },

  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(193,85,60,0.14)",
    border: `1px solid rgba(193,85,60,0.3)`,
    color: OXBLOOD_STRONG,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "22px",
  },

  badge: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "var(--radius-full)",
    background: PAPER_RAISED,
    border: `1px solid ${LINE}`,
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: GRAPHITE,
    marginBottom: "16px",
  },

  title: {
    fontFamily: "var(--font-display)",
    fontSize: isMobile ? "30px" : "36px",
    lineHeight: "1.08",
    letterSpacing: "-0.01em",
    fontWeight: "800",
    margin: "0 0 12px",
  },

  bodyText: {
    fontSize: "16px",
    lineHeight: "1.55",
    color: GRAPHITE,
    margin: "0 0 32px",
    maxWidth: "400px",
  },

  revealHero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "18px",
  },

  revealHeroValue: {
    fontFamily: "var(--font-display)",
    fontSize: isMobile ? "56px" : "68px",
    fontWeight: "800",
    lineHeight: "1",
    color: OXBLOOD_STRONG,
    fontVariantNumeric: "tabular-nums",
  },

  revealHeroUnit: {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: GRAPHITE,
    marginTop: "6px",
  },

  revealStatsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "24px",
  },

  revealStat: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 14px",
    borderRadius: "var(--radius-full)",
    background: PAPER_RAISED,
    border: `1px solid ${LINE}`,
    color: INK,
    fontSize: "13px",
    fontWeight: "600",
  },

  optionGrid: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "28px",
  },

  optionCard: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "var(--radius-lg)",
    border: `1px solid ${LINE}`,
    background: PAPER_RAISED,
    color: INK,
    textAlign: "left",
    cursor: "pointer",
    transition: "border-color var(--duration-hover) ease, background var(--duration-hover) ease",
  },

  optionCardSelected: {
    border: `1px solid ${OXBLOOD}`,
    background: "rgba(193,85,60,0.12)",
  },

  optionCardTitle: {
    fontWeight: "700",
    fontSize: "15px",
    marginBottom: "3px",
  },

  optionCardDesc: {
    fontSize: "13px",
    color: GRAPHITE,
  },

  numericInputWrap: {
    width: "100%",
    marginBottom: "28px",
  },

  numericInput: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "var(--radius-md)",
    border: `1px solid ${LINE}`,
    background: PAPER_RAISED,
    color: INK,
    outline: "none",
    textAlign: "center",
    fontFamily: "var(--font-display)",
    // >=16px: iOS auto-zooms the page on focus below that, regardless of
    // user-scalable=no (unreliable for this specific behavior on WebKit).
    fontSize: "22px",
    boxSizing: "border-box",
  },

  primaryButton: {
    width: "100%",
    padding: "16px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    background: OXBLOOD,
    color: "#f5efe8",
    fontWeight: "600",
    fontSize: "15px",
    transition: "transform var(--duration-hover) var(--ease-out), background var(--duration-hover) ease",
  },

  primaryButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  skipLink: {
    marginTop: "14px",
    background: "none",
    border: "none",
    color: GRAPHITE,
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
  },

  backLink: {
    position: "absolute",
    top: "calc(24px + env(safe-area-inset-top))",
    left: "24px",
    background: "none",
    border: "none",
    color: GRAPHITE,
    fontSize: "14px",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  errorBox: {
    marginTop: "16px",
    padding: "11px 13px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(193,85,60,0.12)",
    border: "1px solid rgba(193,85,60,0.3)",
    color: OXBLOOD_STRONG,
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
});

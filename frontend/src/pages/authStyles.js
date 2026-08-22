// The auth hero is a deliberate, permanently-dark brand moment (like the
// approved "Ledger" direction mockup) — it doesn't follow the app's
// light/dark preference, so colors here are the dark-palette values
// directly rather than the --token custom properties.
const PAPER = "#13110d";
const PAPER_RAISED = "#1c1912";
const INK = "#f2f0e9";
const GRAPHITE = "#a39c8c";
const OXBLOOD = "#c1553c";
const OXBLOOD_STRONG = "#d66b4f";
const LINE = "#2a251c";

export const getAuthStyles = (isMobile) => ({
  loginPage: {
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
    overflow: isMobile ? "auto" : "hidden",
    boxSizing: "border-box",
  },

  loginNav: {
    minHeight: "68px",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "calc(18px + env(safe-area-inset-top)) 32px 18px",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },

  loginBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontFamily: "var(--font-display)",
    fontSize: "24px",
    fontWeight: "700",
  },

  loginBrandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "var(--radius-md)",
    background: OXBLOOD,
    color: PAPER,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontWeight: "800",
  },

  loginHero: {
    maxWidth: "1250px",
    height: isMobile ? "auto" : "calc(100vh - 68px)",
    margin: "0 auto",
    padding: isMobile ? "20px 24px calc(40px + env(safe-area-inset-bottom))" : "6px 32px 20px",
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.08fr 0.92fr",
    gap: isMobile ? "30px" : "34px",
    alignItems: "center",
    boxSizing: "border-box",
  },

  loginLeft: {
    maxWidth: "620px",
  },

  loginBadge: {
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

  loginHeroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: isMobile ? "44px" : "64px",
    lineHeight: "0.95",
    letterSpacing: "-0.01em",
    margin: "0 0 14px",
    fontWeight: "800",
  },

  loginHeroText: {
    fontSize: "16px",
    lineHeight: "1.55",
    color: GRAPHITE,
    maxWidth: "560px",
    marginBottom: "16px",
  },

  trustStats: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    marginBottom: "20px",
    color: GRAPHITE,
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  trustStatItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  loginAccessBox: {
    width: "100%",
    maxWidth: "430px",
    padding: "20px",
    borderRadius: "var(--radius-lg)",
    background: PAPER_RAISED,
    border: `1px solid ${LINE}`,
  },

  loginLabel: {
    display: "block",
    marginBottom: "8px",
    marginTop: "14px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: GRAPHITE,
  },

  loginInput: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "var(--radius-md)",
    border: `1px solid ${LINE}`,
    background: PAPER,
    color: INK,
    outline: "none",
    // >=16px: iOS auto-zooms the page on focus below that, regardless of
    // user-scalable=no (unreliable for this specific behavior on WebKit).
    fontSize: "16px",
    boxSizing: "border-box",
    transition: `border-color var(--duration-hover) ease, box-shadow var(--duration-hover) ease`,
  },

  loginButton: {
    width: "100%",
    padding: "15px",
    marginTop: "18px",
    borderRadius: "var(--radius-full)",
    border: "none",
    cursor: "pointer",
    background: OXBLOOD,
    color: "#f5efe8",
    fontWeight: "600",
    fontSize: "15px",
    transition: `transform var(--duration-hover) var(--ease-out), background var(--duration-hover) ease, box-shadow var(--duration-hover) ease`,
  },

  loginButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  switchLine: {
    marginTop: "18px",
    textAlign: "center",
    color: GRAPHITE,
    fontSize: "14px",
  },

  switchLink: {
    color: OXBLOOD_STRONG,
    fontWeight: "600",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "14px",
  },

  errorBox: {
    marginTop: "14px",
    padding: "11px 13px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(193,85,60,0.12)",
    border: "1px solid rgba(193,85,60,0.3)",
    color: OXBLOOD_STRONG,
    fontSize: "14px",
  },

  loginRight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  // ---- Realistic device frame ----
  phoneFrame: {
    width: isMobile ? "355px" : "375px",
    height: isMobile ? "728px" : "770px",
    borderRadius: "62px",
    padding: "14px",
    background: "linear-gradient(155deg, #55524c 0%, #201d18 22%, #0c0b09 55%, #3a372f 100%)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    position: "relative",
    flexShrink: 0,
  },

  phoneSideButton: {
    position: "absolute",
    background: "#100f0d",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: "48px",
    background: PAPER,
    color: INK,
    overflow: "hidden",
    position: "relative",
  },

  island: {
    position: "absolute",
    top: "14px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100px",
    height: "28px",
    borderRadius: "var(--radius-full)",
    background: "#000",
    zIndex: 30,
  },

  statusRow: {
    position: "absolute",
    top: "16px",
    left: "20px",
    right: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    fontWeight: "600",
    color: INK,
    zIndex: 20,
  },

  statusIcons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  homeIndicator: {
    position: "absolute",
    bottom: "9px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "108px",
    height: "4px",
    borderRadius: "var(--radius-full)",
    background: "rgba(242,240,233,0.4)",
    zIndex: 30,
  },

  screenScroll: {
    height: "100%",
    overflow: "hidden",
    padding: "56px 18px 28px",
    boxSizing: "border-box",
  },

  iconCircle: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(20,18,14,0.55)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: INK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Full-bleed hero photo: negative margins cancel screenScroll's own
  // padding so the image reaches the phone's real edges (phoneScreen's own
  // overflow:hidden + border-radius clips the top corners correctly).
  heroImageWrap: {
    position: "relative",
    margin: "-56px -18px 0 -18px",
    height: "360px",
    overflow: "hidden",
  },

  mealImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  heroHeaderRow: {
    position: "absolute",
    top: "58px",
    left: "18px",
    right: "18px",
    display: "flex",
    justifyContent: "space-between",
    zIndex: 3,
  },

  heroFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "150px",
    background: `linear-gradient(to bottom, rgba(19,17,13,0) 0%, ${PAPER} 92%)`,
    zIndex: 2,
  },

  foodLabel: {
    position: "absolute",
    zIndex: 3,
    padding: "5px 9px",
    borderRadius: "var(--radius-full)",
    background: "rgba(242,240,233,0.95)",
    color: PAPER,
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: "10px",
  },

  previewStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "10px",
  },

  previewStat: {
    padding: "9px 10px",
    borderRadius: "14px",
    background: PAPER_RAISED,
    border: `1px solid ${LINE}`,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  previewStatLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },

  previewStatKey: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: GRAPHITE,
  },

  previewStatValue: {
    fontFamily: "var(--font-mono)",
    fontWeight: "600",
    fontSize: "13px",
  },

  aiPreview: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "15px",
    background: "rgba(193,85,60,0.12)",
    border: "1px solid rgba(193,85,60,0.25)",
    color: INK,
    fontSize: "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },

  heroActions: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
  },

  heroActionGhost: {
    flex: 1,
    padding: "13px",
    borderRadius: "var(--radius-full)",
    border: `1px solid ${LINE}`,
    background: "transparent",
    color: INK,
    fontFamily: "var(--font-body)",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },

  heroActionPrimary: {
    flex: 1,
    padding: "13px",
    borderRadius: "var(--radius-full)",
    border: "none",
    background: OXBLOOD,
    color: "#f5efe8",
    fontFamily: "var(--font-body)",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
});

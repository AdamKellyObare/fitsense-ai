export const getAuthStyles = (isMobile) => ({
  loginPage: {
    position: "fixed",
    inset: 0,
    width: "100vw",
    height: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 35%), linear-gradient(135deg, #020617, #0f172a)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflow: isMobile ? "auto" : "hidden",
    boxSizing: "border-box",
  },

  loginNav: {
    height: "68px",
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "18px 32px",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },

  loginBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "24px",
    fontWeight: "900",
  },

  loginBrandIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#34d399,#22c55e)",
    color: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  loginHero: {
    maxWidth: "1250px",
    height: isMobile ? "auto" : "calc(100vh - 68px)",
    margin: "0 auto",
    padding: isMobile ? "20px 24px 40px" : "6px 32px 20px",
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
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: "700",
    marginBottom: "14px",
  },

  loginHeroTitle: {
    fontSize: isMobile ? "38px" : "48px",
    lineHeight: "1.05",
    letterSpacing: "-1.3px",
    margin: "0 0 12px",
    fontWeight: "900",
  },

  loginHeroText: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#94a3b8",
    maxWidth: "560px",
    marginBottom: "14px",
  },

  trustStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  loginAccessBox: {
    width: "100%",
    maxWidth: "430px",
    padding: "17px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  loginLabel: {
    display: "block",
    marginBottom: "8px",
    marginTop: "12px",
    color: "#cbd5e1",
    fontWeight: "700",
  },

  loginInput: {
    width: "100%",
    padding: "13px",
    borderRadius: "13px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#1e293b",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  },

  loginButton: {
    width: "100%",
    padding: "14px",
    marginTop: "16px",
    borderRadius: "13px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "white",
    fontWeight: "900",
    fontSize: "16px",
  },

  loginButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  switchLine: {
    marginTop: "16px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },

  switchLink: {
    color: "#34d399",
    fontWeight: "700",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "14px",
  },

  errorBox: {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    fontSize: "14px",
  },

  loginRight: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  phoneFrame: {
    width: isMobile ? "310px" : "325px",
    height: isMobile ? "630px" : "630px",
    borderRadius: "50px",
    padding: "7px",
    background:
      "linear-gradient(135deg, #64748b, #111827 35%, #020617 70%, #64748b)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    position: "relative",
    flexShrink: 0,
  },

  phoneScreen: {
    width: "100%",
    height: "100%",
    borderRadius: "43px",
    background: "linear-gradient(180deg,#0f172a,#020617)",
    overflow: "hidden",
    padding: "13px",
    boxSizing: "border-box",
    position: "relative",
  },

  phoneStatusBar: {
    height: "30px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    color: "white",
    marginBottom: "7px",
  },

  phoneTime: {
    fontSize: "12px",
    fontWeight: "800",
    paddingLeft: "4px",
  },

  dynamicIsland: {
    width: "90px",
    height: "25px",
    borderRadius: "999px",
    background: "#000",
  },

  iosIcons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "7px",
  },

  cellularIcon: {
    display: "flex",
    alignItems: "flex-end",
    gap: "2px",
    height: "12px",
  },

  wifiSvg: {
    fontSize: "14px",
    fontWeight: "bold",
    transform: "rotate(90deg)",
    display: "inline-block",
  },

  batteryOuter: {
    width: "23px",
    height: "11px",
    border: "1.6px solid white",
    borderRadius: "4px",
    position: "relative",
    display: "inline-block",
  },

  batteryInner: {
    position: "absolute",
    left: "2px",
    top: "2px",
    width: "15px",
    height: "5px",
    borderRadius: "2px",
    background: "white",
  },

  batteryCap: {
    position: "absolute",
    right: "-4px",
    top: "3px",
    width: "2px",
    height: "5px",
    borderRadius: "2px",
    background: "white",
  },

  phoneHeader: {
    height: "40px",
    display: "grid",
    gridTemplateColumns: "34px 1fr 34px",
    alignItems: "center",
    marginBottom: "7px",
  },

  phoneTitle: {
    textAlign: "center",
    fontWeight: "800",
    fontSize: "15px",
  },

  iconCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.13)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scanCard: {
    padding: "9px",
    borderRadius: "19px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  scanCardTitle: {
    color: "#e2e8f0",
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "8px",
  },

  scanFrame: {
    height: "178px",
    borderRadius: "17px",
    overflow: "hidden",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  mealImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  scanOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.18))",
  },

  foodLabelOne: {
    position: "absolute",
    top: "14px",
    left: "12px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  foodLabelTwo: {
    position: "absolute",
    right: "10px",
    top: "72px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  foodLabelFour: {
    position: "absolute",
    left: "14px",
    bottom: "18px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.94)",
    color: "#111827",
    fontWeight: "900",
    fontSize: "10px",
  },

  scanCornerTopLeft: {
    position: "absolute",
    top: "54px",
    left: "52px",
    width: "26px",
    height: "26px",
    borderTop: "3px solid white",
    borderLeft: "3px solid white",
  },

  scanCornerTopRight: {
    position: "absolute",
    top: "54px",
    right: "52px",
    width: "26px",
    height: "26px",
    borderTop: "3px solid white",
    borderRight: "3px solid white",
  },

  scanCornerBottomLeft: {
    position: "absolute",
    bottom: "39px",
    left: "52px",
    width: "26px",
    height: "26px",
    borderBottom: "3px solid white",
    borderLeft: "3px solid white",
  },

  scanCornerBottomRight: {
    position: "absolute",
    bottom: "39px",
    right: "52px",
    width: "26px",
    height: "26px",
    borderBottom: "3px solid white",
    borderRight: "3px solid white",
  },

  previewStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "10px",
  },

  previewStat: {
    padding: "9px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  aiPreview: {
    marginTop: "10px",
    padding: "11px",
    borderRadius: "15px",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#e2e8f0",
    fontSize: "13px",
  },

  homeIndicator: {
    position: "absolute",
    bottom: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "105px",
    height: "4px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.45)",
  },
});

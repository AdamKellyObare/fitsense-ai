const CM_PER_INCH = 2.54;
const LB_PER_KG = 2.2046226218;

export function cmToFeetInches(cm) {
  if (cm === "" || cm === null || cm === undefined || Number.isNaN(Number(cm))) {
    return { feet: "", inches: "" };
  }
  const totalInches = Number(cm) / CM_PER_INCH;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return { feet: String(feet), inches: String(inches) };
}

export function feetInchesToCm(feet, inches) {
  const f = Number(feet) || 0;
  const i = Number(inches) || 0;
  if (feet === "" && inches === "") return "";
  return String(Math.round((f * 12 + i) * CM_PER_INCH * 10) / 10);
}

export function kgToLb(kg) {
  if (kg === "" || kg === null || kg === undefined || Number.isNaN(Number(kg))) return "";
  return String(Math.round(Number(kg) * LB_PER_KG * 10) / 10);
}

export function lbToKg(lb) {
  if (lb === "") return "";
  return String(Math.round((Number(lb) / LB_PER_KG) * 10) / 10);
}

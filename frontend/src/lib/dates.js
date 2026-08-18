// Local-calendar-day key, e.g. "2026-08-05" — deliberately matches the format
// an <input type="date"> produces (always local, never UTC). Using this
// everywhere a meal needs to be bucketed by day keeps Meals.jsx's date
// filter, the Overview "today" total, and the weekly chart all agreeing on
// which day a meal belongs to, regardless of the viewer's timezone.
export function localDateKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isToday(timestamp) {
  return localDateKey(timestamp) === localDateKey(new Date());
}

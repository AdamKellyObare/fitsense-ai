import { useCallback, useEffect, useState } from "react";

function initialDarkMode() {
  const saved = localStorage.getItem("fitsense_theme");
  return saved ? JSON.parse(saved) : true;
}

export function useTheme() {
  const [darkMode, setDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("fitsense_theme", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggle = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, toggle };
}

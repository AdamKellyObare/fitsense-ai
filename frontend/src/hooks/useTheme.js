import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

function initialDarkMode() {
  const saved = localStorage.getItem("fitsense_theme");
  return saved ? JSON.parse(saved) : true;
}

// Matches --paper-raised in tokens.css for each theme.
const STATUS_BAR_BACKGROUND = { dark: "#1c1912", light: "#ffffff" };

export function useTheme() {
  const [darkMode, setDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("fitsense_theme", JSON.stringify(darkMode));

    if (Capacitor.isNativePlatform()) {
      // Style.Light = light-colored icons (for a dark background), and vice versa.
      StatusBar.setStyle({ style: darkMode ? Style.Light : Style.Dark });
      StatusBar.setBackgroundColor({
        color: darkMode ? STATUS_BAR_BACKGROUND.dark : STATUS_BAR_BACKGROUND.light,
      });
    }
  }, [darkMode]);

  const toggle = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, toggle };
}

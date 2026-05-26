"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

export const ThemeContext = createContext({ theme: "calm", setTheme: () => {} });

const VALID_THEMES = ["calm", "regular", "dark"];
const STORAGE_KEY = "nook-theme";

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("calm");

  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = VALID_THEMES.includes(stored) ? stored : "calm";
    if (initial !== "calm") {
      // calm is already set server-side on <html>; only update when different
      document.documentElement.setAttribute("data-theme", initial);
      setThemeState(initial);
    }
  }, []);

  function setTheme(next) {
    if (!VALID_THEMES.includes(next)) return;
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

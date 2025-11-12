import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
      const themeToApply = savedTheme || "light";
      setThemeState(themeToApply);
      applyTheme(themeToApply);
    } catch (error) {
      console.debug("Theme loading error:", error);
      applyTheme("light");
    }
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    try {
      const htmlElement = document.documentElement;
      if (newTheme === "dark") {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    } catch (error) {
      console.debug("Error applying theme:", error);
    }
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (error) {
      console.debug("Error saving theme:", error);
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

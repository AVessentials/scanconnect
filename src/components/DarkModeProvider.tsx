"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type DarkModeContextType = {
  isDark: boolean;
  toggle: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggle: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("scanconnect-dark-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored !== null ? stored === "true" : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("scanconnect-dark-mode", String(next));
      return next;
    });
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

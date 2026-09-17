"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  mode: ThemeMode;
  primaryColor: string;
  previewColors: [string, string, string]; // [primary, background, surface/accent]
}

export const LIGHT_THEMES: ThemeOption[] = [
  {
    id: "sunset-amber",
    name: "Warm Sunset",
    description: "Golden peach & gentle dusk terracotta",
    mode: "light",
    primaryColor: "#d97706",
    previewColors: ["#d97706", "#fffbeb", "#fde68a"],
  },
  {
    id: "clinical-clean",
    name: "Clinical Clean",
    description: "Crisp slate with classic medical indigo",
    mode: "light",
    primaryColor: "#4f46e5",
    previewColors: ["#4f46e5", "#f8fafc", "#e0e7ff"],
  },
  {
    id: "nordic-frost",
    name: "Nordic Frost",
    description: "Arctic ice & refreshing cyan sky",
    mode: "light",
    primaryColor: "#0284c7",
    previewColors: ["#0284c7", "#f0f9ff", "#bae6fd"],
  },
  {
    id: "emerald-mint",
    name: "Emerald Wellness",
    description: "Botanical mint & organic sage green",
    mode: "light",
    primaryColor: "#059669",
    previewColors: ["#059669", "#f0fdf4", "#a7f3d0"],
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    description: "Soft blush, mauve & coral tones",
    mode: "light",
    primaryColor: "#e11d48",
    previewColors: ["#e11d48", "#fff1f2", "#fecdd3"],
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    description: "Serene lilac & soothing amethyst violet",
    mode: "light",
    primaryColor: "#7c3aed",
    previewColors: ["#7c3aed", "#faf5ff", "#ddd6fe"],
  },
];

export const DARK_THEMES: ThemeOption[] = [
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    description: "Deep obsidian night with royal indigo glow",
    mode: "dark",
    primaryColor: "#6366f1",
    previewColors: ["#6366f1", "#090d16", "#1e1b4b"],
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    description: "Deep carbon black & electric neon cyan",
    mode: "dark",
    primaryColor: "#06b6d4",
    previewColors: ["#06b6d4", "#050811", "#164e63"],
  },
  {
    id: "deep-forest",
    name: "Deep Forest",
    description: "Nocturnal pine & dark emerald moss",
    mode: "dark",
    primaryColor: "#10b981",
    previewColors: ["#10b981", "#04100c", "#064e3b"],
  },
  {
    id: "abyssal-ocean",
    name: "Abyssal Ocean",
    description: "Deep marine navy & oceanic teal glow",
    mode: "dark",
    primaryColor: "#0ea5e9",
    previewColors: ["#0ea5e9", "#030f1d", "#0c4a6e"],
  },
  {
    id: "vampire-velvet",
    name: "Vampire Velvet",
    description: "Dark charcoal with rich bordeaux ruby",
    mode: "dark",
    primaryColor: "#f43f5e",
    previewColors: ["#f43f5e", "#0f0508", "#4c0519"],
  },
  {
    id: "monochrome-slate",
    name: "Monochrome Slate",
    description: "Minimalist dark titanium & graphite",
    mode: "dark",
    primaryColor: "#94a3b8",
    previewColors: ["#94a3b8", "#090a0c", "#1e293b"],
  },
];

const ALL_THEMES = [...LIGHT_THEMES, ...DARK_THEMES];

interface ThemeContextType {
  mode: ThemeMode;
  lightThemeId: string;
  darkThemeId: string;
  activeThemeId: string;
  activeTheme: ThemeOption;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setLightTheme: (themeId: string) => void;
  setDarkTheme: (themeId: string) => void;
  isThemeModalOpen: boolean;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_MODE = "sleep_study_theme_mode";
const STORAGE_KEY_LIGHT = "sleep_study_light_theme";
const STORAGE_KEY_DARK = "sleep_study_dark_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [lightThemeId, setLightThemeIdState] = useState<string>("sunset-amber");
  const [darkThemeId, setDarkThemeIdState] = useState<string>("midnight-indigo");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize from localStorage or fallback defaults on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
      const savedLight = localStorage.getItem(STORAGE_KEY_LIGHT);
      const savedDark = localStorage.getItem(STORAGE_KEY_DARK);

      if (savedMode === "light" || savedMode === "dark") {
        setModeState(savedMode);
      } else {
        setModeState("dark"); // Default is dark mode
      }

      if (savedLight && LIGHT_THEMES.some((t) => t.id === savedLight)) {
        setLightThemeIdState(savedLight);
      } else {
        setLightThemeIdState("sunset-amber");
      }

      if (savedDark && DARK_THEMES.some((t) => t.id === savedDark)) {
        setDarkThemeIdState(savedDark);
      } else {
        setDarkThemeIdState("midnight-indigo");
      }
    } catch {
      // Fallbacks in case localStorage is restricted
    }
  }, []);

  const activeThemeId = mode === "light" ? lightThemeId : darkThemeId;
  const activeTheme = ALL_THEMES.find((t) => t.id === activeThemeId) || (mode === "light" ? LIGHT_THEMES[0] : DARK_THEMES[0]);

  // Apply theme attributes and class to DOM
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Toggle 'dark' class
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set data-theme attribute
    root.setAttribute("data-theme", activeThemeId);
    root.setAttribute("data-mode", mode);
  }, [mode, activeThemeId]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
    } catch {}
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY_MODE, next);
      } catch {}
      return next;
    });
  }, []);

  const setLightTheme = useCallback((themeId: string) => {
    if (!LIGHT_THEMES.some((t) => t.id === themeId)) return;
    setLightThemeIdState(themeId);
    try {
      localStorage.setItem(STORAGE_KEY_LIGHT, themeId);
    } catch {}
  }, []);

  const setDarkTheme = useCallback((themeId: string) => {
    if (!DARK_THEMES.some((t) => t.id === themeId)) return;
    setDarkThemeIdState(themeId);
    try {
      localStorage.setItem(STORAGE_KEY_DARK, themeId);
    } catch {}
  }, []);

  const openThemeModal = useCallback(() => setIsThemeModalOpen(true), []);
  const closeThemeModal = useCallback(() => setIsThemeModalOpen(false), []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        lightThemeId,
        darkThemeId,
        activeThemeId,
        activeTheme,
        toggleMode,
        setMode,
        setLightTheme,
        setDarkTheme,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

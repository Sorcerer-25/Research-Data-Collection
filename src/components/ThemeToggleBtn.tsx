"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon, Palette } from "lucide-react";

interface ThemeToggleBtnProps {
  showPalette?: boolean;
  className?: string;
}

export default function ThemeToggleBtn({ showPalette = true, className = "" }: ThemeToggleBtnProps) {
  const { mode, toggleMode, openThemeModal, activeTheme } = useTheme();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Quick Light / Dark Mode Toggle */}
      <button
        onClick={toggleMode}
        type="button"
        id="theme-toggle-btn"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        title={`Current: ${activeTheme.name} (${mode === "dark" ? "Dark Mode" : "Light Mode"}). Click to switch.`}
        aria-label="Toggle Light and Dark mode"
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          {mode === "dark" ? (
            <Moon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          )}
        </div>
      </button>

      {/* Theme Customizer Palette Trigger */}
      {showPalette && (
        <button
          onClick={openThemeModal}
          type="button"
          id="theme-palette-btn"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors group"
          title="Customize Theme & Colors (12 Styles)"
          aria-label="Open Theme Customizer"
        >
          <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:rotate-12 transition-all" />
        </button>
      )}
    </div>
  );
}

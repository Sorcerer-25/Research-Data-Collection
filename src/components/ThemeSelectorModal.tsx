"use client";

import React, { useState } from "react";
import { useTheme, LIGHT_THEMES, DARK_THEMES, ThemeOption } from "@/lib/theme-context";
import {
  Sun,
  Moon,
  Palette,
  Check,
  X,
  Sparkles,
  Laptop,
} from "lucide-react";

export default function ThemeSelectorModal() {
  const {
    mode,
    setMode,
    lightThemeId,
    setLightTheme,
    darkThemeId,
    setDarkTheme,
    isThemeModalOpen,
    closeThemeModal,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<"light" | "dark">(mode);

  if (!isThemeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900 shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Theme & Color Appearance</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                  12 Styles
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your default Light and Dark themes. The navbar toggle switches between them.
              </p>
            </div>
          </div>

          <button
            onClick={closeThemeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Mode Selector */}
        <div className="px-5 sm:px-6 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-850/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Mode:
          </span>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => {
                setMode("light");
                setActiveTab("light");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "light"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => {
                setMode("dark");
                setActiveTab("dark");
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === "dark"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher for Theme Presets */}
        <div className="px-5 sm:px-6 pt-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("light")}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "light"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Themes (6)</span>
            {mode === "light" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("dark")}
            className={`pb-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "dark"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Themes (6)</span>
            {mode === "dark" && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>
        </div>

        {/* Themes Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(activeTab === "light" ? LIGHT_THEMES : DARK_THEMES).map((theme) => {
              const isSelected =
                activeTab === "light"
                  ? lightThemeId === theme.id
                  : darkThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    if (activeTab === "light") {
                      setLightTheme(theme.id);
                      setMode("light");
                    } else {
                      setDarkTheme(theme.id);
                      setMode("dark");
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {theme.description}
                      </p>
                    </div>

                    {/* Color Swatch Palette Circles */}
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {theme.previewColors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mini Preview Box */}
                  <div
                    className="w-full h-8 rounded-xl border flex items-center justify-between px-3 text-[11px] font-bold shadow-xs mt-1"
                    style={{
                      backgroundColor: theme.previewColors[1],
                      borderColor: theme.previewColors[0] + "40",
                      color: activeTab === "light" ? "#0f172a" : "#f1f5f9",
                    }}
                  >
                    <span>Sample View</span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] text-white font-bold"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Accent
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Theme preferences are saved automatically
          </p>

          <button
            onClick={closeThemeModal}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

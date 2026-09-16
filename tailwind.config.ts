import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "rgb(var(--color-indigo-50) / <alpha-value>)",
          100: "rgb(var(--color-indigo-100) / <alpha-value>)",
          200: "rgb(var(--color-indigo-200) / <alpha-value>)",
          300: "rgb(var(--color-indigo-300) / <alpha-value>)",
          400: "rgb(var(--color-indigo-400) / <alpha-value>)",
          500: "rgb(var(--color-indigo-500) / <alpha-value>)",
          600: "rgb(var(--color-indigo-600) / <alpha-value>)",
          700: "rgb(var(--color-indigo-700) / <alpha-value>)",
          800: "rgb(var(--color-indigo-800) / <alpha-value>)",
          900: "rgb(var(--color-indigo-900) / <alpha-value>)",
          950: "rgb(var(--color-indigo-950) / <alpha-value>)",
        },
        indigo: {
          50: "rgb(var(--color-indigo-50) / <alpha-value>)",
          100: "rgb(var(--color-indigo-100) / <alpha-value>)",
          200: "rgb(var(--color-indigo-200) / <alpha-value>)",
          300: "rgb(var(--color-indigo-300) / <alpha-value>)",
          400: "rgb(var(--color-indigo-400) / <alpha-value>)",
          500: "rgb(var(--color-indigo-500) / <alpha-value>)",
          600: "rgb(var(--color-indigo-600) / <alpha-value>)",
          700: "rgb(var(--color-indigo-700) / <alpha-value>)",
          800: "rgb(var(--color-indigo-800) / <alpha-value>)",
          900: "rgb(var(--color-indigo-900) / <alpha-value>)",
          950: "rgb(var(--color-indigo-950) / <alpha-value>)",
        },
        slate: {
          50: "rgb(var(--color-slate-50) / <alpha-value>)",
          100: "rgb(var(--color-slate-100) / <alpha-value>)",
          200: "rgb(var(--color-slate-200) / <alpha-value>)",
          300: "rgb(var(--color-slate-300) / <alpha-value>)",
          400: "rgb(var(--color-slate-400) / <alpha-value>)",
          500: "rgb(var(--color-slate-500) / <alpha-value>)",
          600: "rgb(var(--color-slate-600) / <alpha-value>)",
          700: "rgb(var(--color-slate-700) / <alpha-value>)",
          800: "rgb(var(--color-slate-800) / <alpha-value>)",
          850: "rgb(var(--color-slate-850) / <alpha-value>)",
          900: "rgb(var(--color-slate-900) / <alpha-value>)",
          950: "rgb(var(--color-slate-950) / <alpha-value>)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        // Zinc replaces Tailwind's blue-tinted coolGray everywhere.
        // Neutral undertone = refined, not "default dark mode."
        gray: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        surface: {
          base:    "#09090b",  // zinc-950
          raised:  "#18181b",  // zinc-900
          overlay: "#27272a",  // zinc-800
        },
        // Indigo replaces blue-600 — same family, more considered.
        brand: {
          DEFAULT: "#6366f1",  // indigo-500
          dark:    "#4f46e5",  // indigo-600
          subtle:  "#1e1b4b",  // indigo-950
          text:    "#818cf8",  // indigo-400
        },
        agent: {
          tax:      "#a78bfa",  // violet-400
          cashflow: "#34d399",  // emerald-400
          advisor:  "#818cf8",  // indigo-400
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger:  "#f87171",
      },
    },
  },
  plugins: [],
};

export default config;

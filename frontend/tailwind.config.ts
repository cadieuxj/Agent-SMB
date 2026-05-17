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
          base:    "#0a0e1a",  // deep navy-black — more premium than pure zinc
          raised:  "#111827",  // slate-900 — warm blue-dark for cards
          overlay: "#1e2433",  // deep blue-gray for popovers/hover
        },
        // Indigo replaces blue-600 — same family, more considered.
        brand: {
          DEFAULT: "#6366f1",  // indigo-500
          dark:    "#4f46e5",  // indigo-600
          subtle:  "#1e1b4b",  // indigo-950
          text:    "#818cf8",  // indigo-400
          glow:    "rgba(99,102,241,0.15)", // for box-shadow glows
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

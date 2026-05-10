import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          base:    "#030712",
          raised:  "#111827",
          overlay: "#1f2937",
        },
        brand: {
          DEFAULT: "#2563eb",
          dark:    "#1d4ed8",
          subtle:  "#172554",
          text:    "#60a5fa",
        },
        agent: {
          tax:      "#a78bfa",
          cashflow: "#34d399",
          advisor:  "#60a5fa",
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

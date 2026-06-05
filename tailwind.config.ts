import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070B14",
        midnight: "#0B1020",
        navy: "#111A35",
        panel: "#121B2E",
        line: "rgba(190, 211, 255, 0.16)",
        ice: "#D9E7FF",
        sky: "#78B7FF",
        mint: "#7DE2D1"
      },
      boxShadow: {
        glow: "0 0 80px rgba(120, 183, 255, 0.16)",
        card: "0 24px 80px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

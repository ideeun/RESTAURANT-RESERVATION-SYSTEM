import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          bg: "#f4a4b4",
          card: "#fef3dc",
          btn: "#e8899a",
          btnHover: "#d97a8b",
          dark: "#2d2d2d",
        },
        floor: {
          wall: "#e8eaed",
          available: "#7eb8da",
          occupied: "#f4a574",
          selected: "#e8899a",
          maintenance: "#c4c4c4",
          bar: "#d4a574",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(45, 45, 45, 0.08)",
        float: "0 12px 40px rgba(232, 137, 154, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

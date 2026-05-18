import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f3",
          100: "#f5ebe0",
          500: "#b45309",
          600: "#92400e",
          700: "#78350f",
          900: "#431407",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

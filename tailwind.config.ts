import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef9ff",
          100: "#d9f0ff",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        // State B (authenticated shell) surface tokens
        shell: {
          bg: "#0D1117",
          surface: "#161B22",
          border: "#30363D",
        },
        // The ARS "pulse" accent
        accent: {
          DEFAULT: "#00D4FF",
        },
        // Vertical identity colors
        vertical: {
          bio: "#E84343",
          climate: "#2D7A4A",
          energy: "#F5A623",
        },
        ink: {
          primary: "#E6EDF3",
          secondary: "#8B949E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

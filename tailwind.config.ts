import type { Config } from "tailwindcss";

  const config: Config = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./content/**/*.{md,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          brand: {
            50:  "#eef9ff",
            100: "#d9f0ff",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0369a1",
            900: "#0c4a6e",
          },
        },
        fontFamily: {
          sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        },
      },
    },
    plugins: [],
  };
  export default config;
  
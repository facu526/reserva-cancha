import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./actions/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        field: {
          50: "#f2fbf3",
          100: "#def7e2",
          500: "#1f9d55",
          600: "#168246",
          700: "#11683a"
        },
        ink: "#111513"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 21, 19, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

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
      fontFamily: {
        sans: ["var(--font-quicksand)", "Quicksand", "sans-serif"],
      },
      colors: {
        // Bubbly Soft-UI Palette
        blush:   { DEFAULT: "#FFD1DC", light: "#FFE8EE", dark: "#F9A8C0" },
        lavender:{ DEFAULT: "#E8D5F5", light: "#F3EAF9", dark: "#C9A7E8" },
        mint:    { DEFAULT: "#C8F0E0", light: "#E4F8F0", dark: "#8DDFC1" },
        cream:   { DEFAULT: "#FAF8F5", soft: "#F5F0EB" },
        rose:    {
          50:  "#fff0f3",
          100: "#FFD1DC",
          200: "#ffb3c4",
          300: "#ff8fab",
          400: "#ff6b8f",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        // Dark mode tokens
        dark: {
          bg:    "#1E1625",
          card:  "#2A1F35",
          border:"#3D2E4D",
        }
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        "soft":    "0 20px 60px rgba(0,0,0,0.05)",
        "soft-md": "0 12px 40px rgba(255,182,193,0.18)",
        "soft-lg": "0 25px 80px rgba(255,182,193,0.22)",
        "glow":    "0 0 30px rgba(255,182,193,0.35)",
        "inset-soft": "inset 0 2px 8px rgba(255,182,193,0.15)",
      },
      backgroundImage: {
        "gradient-bubbly":
          "linear-gradient(135deg, #FFD1DC 0%, #E8D5F5 50%, #C8F0E0 100%)",
        "gradient-rose-soft":
          "linear-gradient(135deg, #FFD1DC 0%, #F9A8C0 100%)",
        "gradient-lavender-soft":
          "linear-gradient(135deg, #E8D5F5 0%, #C9A7E8 100%)",
        "gradient-mint-soft":
          "linear-gradient(135deg, #C8F0E0 0%, #8DDFC1 100%)",
        "gradient-card-light":
          "linear-gradient(160deg, #ffffff 0%, #fdf4f8 100%)",
      },
      animation: {
        "float":       "float 3s ease-in-out infinite",
        "pulse-soft":  "pulse-soft 2.5s ease-in-out infinite",
        "wiggle":      "wiggle 0.5s ease-in-out",
        "bounce-soft": "bounce-soft 1.5s ease-in-out infinite",
        "fade-up":     "fade-up 0.5s ease-out forwards",
        "spin-slow":   "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.85", transform: "scale(1.03)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%":      { transform: "rotate(3deg)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

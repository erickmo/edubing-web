import type { Config } from "tailwindcss";

/**
 * Edubing design system tokens.
 *
 * Aesthetic: "Friendly Scholar" — warm, editorial-playful, trustworthy.
 * Display font = Fraunces (soft serif, characterful), body = Plus Jakarta
 * Sans (geometric, Indonesian-designed). Palette is a warm cream canvas with
 * deep ink navy, a vivid tangerine brand, and a fresh teal secondary.
 *
 * These tokens are the single source of truth the whole site inherits.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm paper canvas
        cream: {
          DEFAULT: "#FBF7F0",
          50: "#FEFCF8",
          100: "#FBF7F0",
          200: "#F4ECDD",
        },
        // Deep ink — primary text + trustworthy anchor
        ink: {
          DEFAULT: "#1E2235",
          soft: "#3A4060",
          muted: "#6B7194",
        },
        // Brand — vivid tangerine, energetic + friendly
        brand: {
          50: "#FFF3EC",
          100: "#FFE2D1",
          200: "#FFC3A3",
          300: "#FF9F6E",
          400: "#FF7A3D",
          500: "#FB5A12",
          600: "#E1470A",
          700: "#B7390C",
          800: "#8F2F12",
          900: "#5C2010",
        },
        // Secondary — fresh teal / leaf, fresh + educative
        teal: {
          50: "#EAFBF5",
          100: "#CDF4E7",
          200: "#9CE8D1",
          300: "#5FD6B4",
          400: "#2FBF97",
          500: "#16A37D",
          600: "#0C8366",
          700: "#0B6852",
          800: "#0C5343",
          900: "#0B4338",
        },
        // Accent — sunny highlight for stickers / underlines
        sun: {
          DEFAULT: "#FFC857",
          soft: "#FFE2A0",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        blob: "2.5rem",
      },
      boxShadow: {
        // Playful "lifted card" shadows with warm tint
        soft: "0 2px 12px -4px rgba(30, 34, 53, 0.10)",
        card: "0 12px 32px -12px rgba(30, 34, 53, 0.18)",
        lift: "0 18px 48px -18px rgba(251, 90, 18, 0.35)",
        // Sticker/offset border shadow (hard edge, retro-playful)
        sticker: "4px 4px 0 0 rgba(30, 34, 53, 1)",
        "sticker-brand": "4px 4px 0 0 rgba(251, 90, 18, 1)",
      },
      backgroundImage: {
        "grid-dots":
          "radial-gradient(rgba(30,34,53,0.07) 1.2px, transparent 1.2px)",
      },
      backgroundSize: {
        dots: "22px 22px",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        "float-rev": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(12px) rotate(-4deg)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "float-slow": "float-slow 7s ease-in-out infinite",
        "float-rev": "float-rev 9s ease-in-out infinite",
        "rise-in": "rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

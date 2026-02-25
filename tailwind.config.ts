import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neffy brand — from neffy.com and ars-pharma.com
        neffy: {
          50: "#E5F8FF",   // Light blue background
          100: "#C3F0FE",  // Lighter accent background
          200: "#8DE0FD",  // Soft cyan
          300: "#4DC9F6",  // Medium cyan
          400: "#0BE2FF",  // Bright cyan accent (from neffy.com)
          500: "#002FA7",  // Primary deep blue (neffy.com nav/brand)
          600: "#01288E",  // Darker blue
          700: "#002075",  // Deep blue
          800: "#00185C",  // Very dark blue
          900: "#001044",  // Darkest blue
        },
        accent: {
          50: "#f4fce9",
          100: "#e6f7cc",
          200: "#cef09e",
          300: "#b0e465",
          400: "#96D629",  // Lime green CTA (ars-pharma.com buttons)
          500: "#7ab822",
          600: "#5e921a",
          700: "#476e16",
          800: "#3a5816",
          900: "#324b17",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

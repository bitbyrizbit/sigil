/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#EAECEF", // light-medium grey canvas
        canvasSubtle: "#DEE1E6",
        paper: "#FFFFFF",
        ink: "#1E2028",
        inkMuted: "#5F6575",
        pinkPrimary: "#970747", // dark pink primary hero
        fuchsia: "#D8125B",
        allow: "#009B4D",
        hold: "#FFCC00",
        block: "#D8125B",
        isolate: "#970747",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        num: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"], // modern geometric numbers, zero typewriter font
      },
      boxShadow: {
        pink: "3px 3px 0px #970747",
        "pink-lg": "5px 5px 0px #970747",
        ink: "3px 3px 0px #1E2028",
        "ink-sm": "2px 2px 0px #1E2028",
        "ink-lg": "5px 5px 0px #1E2028",
        ledger: "3px 3px 0px #1E2028",
        "ledger-sm": "2px 2px 0px #1E2028",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

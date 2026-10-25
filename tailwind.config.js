/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f2ec",
        ink: "#171815",
        acid: "#d7ff3f",
        muted: "#77786f"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        mono: ["DM Mono", "monospace"]
      }
    }
  },
  plugins: []
};
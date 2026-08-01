/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f172a",
        glassBg: "rgba(30, 41, 59, 0.45)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        brandCyan: "#06b6d4",
        brandPurple: "#8b5cf6",
        brandOrange: "#f97316",
        brandRed: "#ef4444"
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(12px)',
      }
    },
  },
  plugins: [],
}

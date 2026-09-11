/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F2",
        ink: "#1C1C1A",
        muted: "#5C5A56",
        teal: "#0E6B5C",
        ul: "#005335",
        "ul-modern": "#00B140",
        "ul-heritage": "#003726",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        well: "0 0 0 1px rgba(28, 28, 26, 0.1)",
      },
    },
  },
  plugins: [],
};

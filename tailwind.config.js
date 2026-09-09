/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        ephula: {
          primary: "#1B6B2E",
          secondary: "#0D9488",
          accent: "#F59E0B",
          neutral: "#1F2937",
          "base-100": "#FFFFFF",
          info: "#2563EB",
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
        },
      },
    ],
  },
};

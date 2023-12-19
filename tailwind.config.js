/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1A1A1A",
        "input-bg": "#3d3d3d95",
        "toast-bg": "#3d3d3d",
        text: "#FDFDFD",
        secondary: "#c1e1ea",
        primary: "#ffbc42",
        panel: "#669bbc",
        hovered: "#a8d0db",
        "hovered-btn": "#fd9343",
      },
    },
  },
  plugins: [],
};

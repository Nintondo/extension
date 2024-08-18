/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        33: "8.6rem",
        20.5: "6.01rem",
        38: "9.5rem",
        38.1: "9.6875rem",
      },
      height: {
        33: "8.6rem",
        38: "9.5rem",
        38.1: "9.6875rem",
      },
      colors: {
        bg: "#0d0c0c",
        "input-bg": "#3d3d3d95",
        "input-light": "#3d3d3d35",
        "toast-bg": "#3d3d3d",
        text: "#FDFDFD",
        secondary: "#c1e1ea",
        primary: "#ffbc42",
        panel: "#669bbc",
        hovered: "#a8d0db",
        "hovered-btn": "#fd9343",
        "light-orange": "#ff863a"
      },
      screens: {
        "standard": "455px",
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1536px"
      }
    },
  },
  plugins: [],
};

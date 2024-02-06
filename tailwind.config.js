/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      width: {
        33: "8.6rem",
        20.5: "5.2rem",
      },
      height: {
        33: "8.6rem",
      },
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

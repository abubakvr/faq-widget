/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  prefix: "fag-",
  theme: {
    extend: {},
  },
  plugins: [],
  // Important: scope all styles to the widget container
  important: ".fag-widget-container",
};

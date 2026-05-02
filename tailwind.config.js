/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          0: "#98B4D0",
          100: "#DDE1C0",
          300: "#EFF9F0",
          500: "#878180",
        },
      },
    },
  },
  plugins: [],
}

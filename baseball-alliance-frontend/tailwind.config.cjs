/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Oswald',
          'ui-sans-serif',
          'system-ui',
          // …you can leave the rest of the default stack here
        ],
      },
    },
  },
  plugins: [],
}

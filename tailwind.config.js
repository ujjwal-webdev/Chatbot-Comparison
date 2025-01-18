/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'srh-blue': '#003087',
        'srh-blue-light': '#0047AB',
        'srh-orange': '#FF5F00',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
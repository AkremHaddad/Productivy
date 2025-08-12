/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': 'rgba(74, 111, 165, 1)',
        'secondary-light': 'rgba(107, 140, 66, 1)',
        'background-light': 'rgba(224, 229, 236, 1)',
        'text-light': 'rgba(51, 51, 51, 1)',
        'ui-light': 'rgba(224, 229, 236, 1)',
        'primary-dark': 'rgba(23, 43, 77, 1)',
        'secondary-dark': 'rgba(12, 118, 83, 1)',
        'accent': 'rgba(190, 255, 0, 1)',
        'background-dark': 'rgba(0, 37, 43, 1)',
        'text-dark': 'rgba(224, 224, 224, 1)',
        'navbar-dark': 'rgba(44, 48, 54, 1)',
      },
      fontFamily: {
        'jaro': ['Jaro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
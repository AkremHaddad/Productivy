/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  darkMode: 'class', // ← enables dark mode via a class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': 'rgba(74, 111, 165, 1)',
        'secondary-light': '#6D8134',
        'text-light': 'rgba(51, 51, 51, 1)',
        // 'navbar-light': 'rgba(78, 84, 94, 1)', 
        'primary-dark': 'rgba(23, 43, 77, 1)',
        'secondary-dark': '#6D8134',
        'accent': '#BEFF00',
        // 'background-dark': 'rgba(0, 37, 43, 1)',
        'text-dark': 'rgba(224, 224, 224, 1)',
        // 'navbar-dark': '#010409',
        // 'accent-dark': '#11576D',
        'accent-dark': '#40c1bb',
        'accent-light': '#2D8984',
        // -------------------------
        'background-dark': '#0D1117',
        'background-light': '#FFFFFF',
        'border-dark': '#3D444D',
        'border-light': '#D1D9E0',
        'ui-light': '#F2F2F2',
        'ui-dark': '#010409',
        'header-light': '#F6F8FA',
        'header-dark': '#010409',
      },
      fontFamily: {
        'jaro': ['Jaro', 'sans-serif'],
      },
      keyframes: {
        fadeScale: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        }
      },
      animation: {
        fadeScale: 'fadeScale 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
}


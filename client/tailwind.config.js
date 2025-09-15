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
        'secondary-light': 'rgba(12, 118, 83, 1)',
        'background-light': '#f6f6f6',
        'text-light': 'rgba(51, 51, 51, 1)',
        'ui-light': 'rgba(224, 229, 236, 1)', 
        'navbar-light': 'rgba(78, 84, 94, 1)', 
        'primary-dark': 'rgba(23, 43, 77, 1)',
        'secondary-dark': 'rgba(12, 118, 83, 1)',
        'accent': '#40c1bb',
        'background-dark': 'rgba(0, 0, 0, 1)',
        // 'background-dark': 'rgba(0, 37, 43, 1)',
        'text-dark': 'rgba(224, 224, 224, 1)',
        'navbar-dark': 'rgba(44, 48, 54, 1)',
        // 'accent-dark': '#11576D',
        'accent-dark': '#40c1bb',
        'accent-light': '#2D8984',
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


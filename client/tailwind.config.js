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
        'primary-dark': 'rgba(23, 43, 77, 1)',

        // Dim/secondary text
        'secondary-light': '#6B655A',
        'secondary-dark': '#9BA1A6',

        // Ink / text
        'text-light': '#24211B',
        'text-dark': '#F3F4F1',

        // Lime accent — full-brightness for fills (both themes), a
        // darker olive variant for text on the light (paper) background
        // so it still holds contrast. accent-deep is a genuine dark green
        // (not just a dimmer lime) for light-theme emphasis that needs
        // real weight — active-sprint highlights, stat numbers, hover
        // states — instead of everything leaning on one soft olive tone.
        'accent': '#C9F24C',
        'accent-dark': '#C9F24C',
        'accent-light': '#5C7A12',
        'accent-deep': '#2F4A0A',

        // Amber, secondary accent used for streaks/milestones
        'amber': '#F2B84C',

        'background-dark': '#0B0D0F',
        'background-light': '#EDE6D3',

        'border-dark': '#262B30',
        'border-light': '#D9CDAE',

        // Surface (cards/panels)
        'ui-light': '#FBF8F0',
        'ui-dark': '#14171A',

        // Raised surface (headers, popovers, modals)
        'header-light': '#F2EAD6',
        'header-dark': '#1C2023',
        'navbar-light': '#F2EAD6',
        'navbar-dark': '#1C2023',
      },
      fontFamily: {
        'jaro': ['Jaro', 'sans-serif'],
        'sans': ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
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


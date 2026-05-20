/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#edd8ff',
          200: '#dbb8ff',
          300: '#c08eff',
          400: '#a855f7', // purple
          500: '#8b5cf6', // violet
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#0f051d',
        },
        dark: {
          50: '#a1a1aa',
          100: '#71717a',
          200: '#52525b',
          300: '#3f3f46',
          400: '#27272a',
          500: '#18181b', // main darkbg
          600: '#09090b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(139, 92, 246, 0.15)',
        'neon-border': '0 0 15px rgba(168, 85, 247, 0.25)',
        'inner-glow': 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'mesh-pulse': 'pulseMesh 12s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        pulseMesh: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '100%': { transform: 'translate(-30px, 30px) scale(0.95)' },
        }
      }
    },
  },
  plugins: [],
}

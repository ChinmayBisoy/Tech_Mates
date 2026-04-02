/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0F172A',
        surface: '#1E293B',
        elevated: '#334155',
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          950: '#1E1B4B',
        },
        accent: {
          50: '#CFFAFE',
          100: '#A5F3FC',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundColor: {
        base: '#0F172A',
        surface: '#1E293B',
        elevated: '#334155',
      },
      textColor: {
        primary: '#F1F5F9',
        secondary: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
      transitionProperty: {
        all: 'all',
      },
      transitionDuration: {
        200: '200ms',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}

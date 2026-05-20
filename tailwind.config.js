/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f0fdf4',   // ultra light green
          100: '#dcfce7',  // soft mint green
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // standard green
          600: '#16a34a',  // deep farm green
          700: '#15803d',
          800: '#166534',  // dark evergreen
          900: '#14532d',  // deep jungle green
          950: '#052e16',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-active': '0 8px 32px 0 rgba(22, 163, 74, 0.15)',
        'glow': '0 0 15px rgba(34, 197, 94, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

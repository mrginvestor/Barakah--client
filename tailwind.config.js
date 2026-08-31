/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          900: '#022C22',
          800: '#064E3B',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
        },
        cream: '#FDFBF7',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

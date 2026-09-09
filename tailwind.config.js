/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#082B49',
          dark: '#051C30',
        },
        richBlue: '#0F4C75',
        gold: {
          DEFAULT: '#D4AF5A',
          light: '#E6C875',
        },
        lightBg: '#F8FAFC',
        darkGreen: '#082B49',
        lightGreen: '#0F4C75',
        emerald: {
          900: '#082B49',
          800: '#082B49',
        },
        cream: '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        senai: {
          red: '#E30613',
          redHover: '#C40410',
          darkRed: '#8B0000',
          blue: '#1E73BE',
          blueHover: '#155D9B',
          green: '#28A745',
          greenHover: '#218838',
          bg: '#F4F6F9',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

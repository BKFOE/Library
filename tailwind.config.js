/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './views/**/*.ejs',
    './public/**/*.html',
    './src/**/*.{html,js}'
  ],
  theme: {
    extend: { colors: {
      "primary-tanGrey": "#E4E7DF",
      "primary-offWhite": "#FDFCF5",
      "accent-gold": "#DB9D24",
      "accent-mauve": "#93778E"
      },
    fontFamily: {
      main: ["Barriecito", "serif"],
      body: ["Montserrat", "serif"]
    }, 
    spacing: {
      '90': '90px',
      '60':'60px',
      '367': '367px',
      '384': '384px'
    },
  },
  },
  plugins: [],
}


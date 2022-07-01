/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'arima': ['Arima', 'cursive']
      },
      colors:{
        'primary': {
          'light' : '#5AB896',
          'dark' : '#8dB451'
        } ,
        'contrast': '#B85A7C'
      }
    },
  },
  plugins: [],
}

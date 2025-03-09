/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",],
    theme: {
      extend: {
      
        height: {
          '26': '6.8rem',
          '27': '7.0rem',
          '110': '30rem',
          '120': '19rem',
          '150': '41rem',
          '58': '13.5rem',
          '200': '100rem'
        },
        width: {
          '110': '30rem',
          '120': '27rem',
          '200': '50rem',
          '300': '80rem',
          '66': '17.5rem'
        },
        keyframes: {

        },
        utilities: {

        }
  
      },
    },
  }
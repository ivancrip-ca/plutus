/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Activar el modo oscuro basado en la clase 'dark'
  theme: {
    extend: {
      animation: {
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wave-slow': 'wave 25s linear infinite',
        'wave-normal': 'wave 15s linear infinite',
        'wave-fast': 'wave 10s linear infinite',
      },
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
        wave: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      utilities: {

      }
    },
  },
  plugins: [],
}
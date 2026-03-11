/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        outlook: {
          blue: '#0078d4',
          'blue-dark': '#005a9e',
          'blue-light': '#deecf9',
          'blue-hover': '#106ebe',
          gray: '#f3f2f1',
          'gray-dark': '#edebe9',
          border: '#d2d0ce',
          text: '#323130',
          'text-light': '#605e5c',
          'text-muted': '#a19f9d',
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

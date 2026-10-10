/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activity: '#333333',
          activeTab: '#1e1e1e',
          inactiveTab: '#2d2d2d',
          border: '#3c3c3c',
          line: '#282828',
          hover: '#2a2d2e',
          text: '#cccccc',
          selected: '#094771',
          accent: '#007acc'
        }
      }
    },
  },
  plugins: [],
}

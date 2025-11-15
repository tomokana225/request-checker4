/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-light': 'var(--background-light)',
        'background-dark': 'var(--background-dark)',
        'card-background-light': 'var(--card-background-light)',
        'card-background-dark': 'var(--card-background-dark)',
        'text-primary-light': 'var(--text-primary-light)',
        'text-primary-dark': 'var(--text-primary-dark)',
        'text-secondary-light': 'var(--text-secondary-light)',
        'text-secondary-dark': 'var(--text-secondary-dark)',
        'border-light': 'var(--border-light)',
        'border-dark': 'var(--border-dark)',
        'input-bg-light': 'var(--input-bg-light)',
        'input-bg-dark': 'var(--input-bg-dark)',
      }
    },
  },
  plugins: [],
}
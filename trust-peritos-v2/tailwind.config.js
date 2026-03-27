/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'prime-blue': '#1e2a5a',
        'prime-blue-light': '#3b82f6',
        'prime-yellow': '#fac70b',
        'prime-text': '#0f172a',
        'prime-text-muted': '#64748b',
      },
    },
  },
  plugins: [],
}

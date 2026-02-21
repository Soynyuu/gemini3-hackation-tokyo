/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          background: 'hsl(var(--background))',
          surface: 'hsl(var(--surface))',
          border: 'hsl(var(--border))',
          primary: 'hsl(var(--primary))',
          secondary: 'hsl(var(--secondary))',
          accent: 'hsl(var(--accent))',
          text: 'hsl(var(--text))',
          muted: 'hsl(var(--muted))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}

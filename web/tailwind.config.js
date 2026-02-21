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
          background: '#050A0F',
          surface: '#0A121A',
          border: '#1E2D3D',
          primary: '#00FFAA',
          secondary: '#7000FF',
          accent: '#FF0055',
          text: '#E0F0FF',
          muted: '#6A8A9E'
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

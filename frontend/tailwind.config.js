/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          bg: '#1a1a2e',
          panel: '#111125',
          user: '#3a3a5c',
          ai: '#2a2a4a',
          accent: '#16c784',
          danger: '#ff6b6b',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        pixel: '0 0 0 2px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
}


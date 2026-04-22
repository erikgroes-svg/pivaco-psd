import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          500: '#3b5fc0',
          600: '#2f4faa',
          700: '#243d8a',
        },
      },
    },
  },
  plugins: [],
}

export default config

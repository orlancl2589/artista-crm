import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080808',
          2: '#0f0f0f',
          3: '#161616',
          4: '#1e1e1e',
        },
        border: {
          DEFAULT: '#2a2a2a',
          2: '#333333',
        },
        accent: {
          DEFAULT: '#c8ff00',
          2: '#a0cc00',
          3: '#e8ff66',
        },
        muted: {
          DEFAULT: '#555555',
          2: '#888888',
        },
        'crm-text': {
          DEFAULT: '#e8e8e8',
          2: '#aaaaaa',
        },
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        lg: '16px',
        xl: '20px',
      },
    },
  },
  plugins: [],
}

export default config
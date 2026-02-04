import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#205529',
          50: '#f0f7f1',
          100: '#daeedd',
          200: '#b8ddbf',
          300: '#8cc59a',
          400: '#5fa673',
          500: '#428856',
          600: '#326d43',
          700: '#205529',
          800: '#1d4624',
          900: '#193a1f',
          '10': 'rgba(32, 85, 41, 0.1)',
          '65': 'rgba(32, 85, 41, 0.65)',
          '80': 'rgba(32, 85, 41, 0.8)',
        },
        cream: {
          DEFAULT: '#faf2e6',
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf2e6',
          300: '#f5e8d3',
          400: '#eed9b8',
          500: '#e5c79a',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['Pontano Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

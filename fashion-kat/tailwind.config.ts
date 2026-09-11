import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // NEGRO — COLOR PRINCIPAL DE LA MARCA
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#3D3D3D',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#111111',
          950: '#0A0A0A',
        },
        // ROSA — COLOR DE ACENTO
        rose: {
          DEFAULT: '#F0508C',
          50: '#FFF1F6',
          100: '#FFE3EE',
          200: '#FFC7DE',
          300: '#FF9BC4',
          400: '#FB6FA9',
          500: '#F0508C',
          600: '#DB2E6E',
          700: '#B81E57',
          800: '#941A48',
          900: '#7A193F',
        },
        // GRIS
        smoke: {
          DEFAULT: '#F4F4F5',
          100: '#FAFAFA',
          200: '#F0F0F1',
          300: '#E4E4E7',
          400: '#D4D4D8',
          500: '#A1A1AA',
          600: '#71717A',
          700: '#52525B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      letterSpacing: {
        brand: '0.16em',
        wider2: '0.08em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,10,10,0.04), 0 8px 24px -12px rgba(10,10,10,0.18)',
        lift: '0 12px 40px -12px rgba(10,10,10,0.28)',
        rose: '0 10px 30px -10px rgba(240,80,140,0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .4s ease both',
        'slide-in-right': 'slide-in-right .32s cubic-bezier(.22,1,.36,1) both',
        'scale-in': 'scale-in .22s cubic-bezier(.22,1,.36,1) both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

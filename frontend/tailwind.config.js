/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        primary: '#C41E3A',
        'primary-hover': '#a81932',
        'primary-light': '#e02d4e',
        surface: {
          0: 'rgb(var(--c-surface-0) / <alpha-value>)',
          1: 'rgb(var(--c-surface-1) / <alpha-value>)',
          2: 'rgb(var(--c-surface-2) / <alpha-value>)',
          3: 'rgb(var(--c-surface-3) / <alpha-value>)',
          4: 'rgb(var(--c-surface-4) / <alpha-value>)',
        },
        border: 'var(--c-border)',
        'border-bright': 'var(--c-border-bright)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'red-glow': 'radial-gradient(ellipse at center, rgba(196,30,58,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'red-glow': '0 0 30px rgba(196,30,58,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

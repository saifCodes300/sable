/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sable: {
          white: '#FFFFFF',
          beige: '#F3EEE5',
          'card-beige': '#F6F1E8',
          pink: '#FDE0E0',
          'pink-text': '#7A2E1D',
          brown: '#7A5230',
          black: '#0A0A0A',
          muted: '#8A7B6C',
          border: '#E8E0D0',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        'btn': '0.08em',
        'logo': '0.14em',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bump: {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(0.92)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        bump: 'bump 300ms ease-out',
        'heart-pop': 'heartPop 280ms ease-out',
      },
    },
  },
  plugins: [],
};

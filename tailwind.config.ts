import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          900: '#312E81',
        },
        accent: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        brand: '#4F46E5',
        'brand-dark': '#3730A3',
        'brand-light': '#EEF2FF',
        surface: '#FFFFFF',
        'surface-2': '#F3F4F8',
        'app-bg': '#F8F7FF',
      },
      fontFamily: {
        heading: ['var(--font-sora)', 'Sora', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(79,70,229,0.18)',
        'brand':    '0 4px 16px rgba(79,70,229,0.22)',
        'brand-lg': '0 12px 40px rgba(79,70,229,0.24)',
        'card':     '0 4px 16px rgba(79,70,229,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-lg':  '0 20px 48px rgba(79,70,229,0.14), 0 8px 20px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config

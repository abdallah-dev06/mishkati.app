/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-persona]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
    './app_preview.html'
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#060913',
          900: '#0A0F1D',
          850: '#0E1528',
          800: '#151F38',
          750: '#1E293B',
          700: '#334155'
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-primary) / <alpha-value>)',
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
          secondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
          glow: 'var(--accent-glow)',
          border: 'var(--accent-border)',
          subtle: 'var(--accent-subtle)'
        },
        persona: {
          primary: 'rgb(var(--accent-primary) / <alpha-value>)',
          secondary: 'rgb(var(--accent-secondary) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'sans-serif'],
        serif: ['Amiri', 'Scheherazade New', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'accent-glow': '0 0 25px -4px var(--accent-glow)',
        'accent-glow-lg': '0 0 45px -6px var(--accent-glow)'
      },
      keyframes: {
        ambientPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.35' },
          '50%': { transform: 'scale(1.08)', opacity: '0.65' }
        }
      },
      animation: {
        'ambient-pulse': 'ambientPulse 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

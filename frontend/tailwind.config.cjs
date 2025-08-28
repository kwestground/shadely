/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
        'md': '0 3px 6px -1px rgba(0,0,0,0.08),0 2px 4px -2px rgba(0,0,0,0.06)',
        'focus': '0 0 0 2px rgba(255,255,255,0.9),0 0 0 4px rgba(63,107,158,0.6)'
      },
      borderRadius: {
        'lg': '0.75rem'
      },
      transitionTimingFunction: {
        'in-out-standard': 'cubic-bezier(0.4,0,0.2,1)'
      }
    }
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        shadelylight: {
          primary: '#3F6B9E',
          'primary-content': '#ffffff',
            primaryFocus: '#335780',
          secondary: '#7B8BA3',
          accent: '#D97706',
          neutral: '#374151',
          'base-100': '#ffffff',
          'base-200': '#F1F5F9',
          'base-300': '#E2E8F0',
          info: '#0ca5e9',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#dc2626'
        }
      },
      {
        shadelydark: {
          primary: '#64A5FF',
          'primary-content': '#0B1221',
          secondary: '#8899B1',
          accent: '#F59E0B',
          neutral: '#1E293B',
          'base-100': '#0F172A',
          'base-200': '#152033',
          'base-300': '#1E293B',
          info: '#38bdf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#f87171'
        }
      }
    ]
  }
};

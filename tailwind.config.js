/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8FA',
        surface: '#FFFFFF',
        ink: {
          primary: '#202938',
          secondary: '#687385',
          muted: '#8F9CAE',
        },
        brand: {
          DEFAULT: '#477CB8',
          hover: '#38669B',
          light: '#EEF4FA',
          border: '#D0DFEF',
        },
        success: {
          DEFAULT: '#4D9574',
          light: '#EDF7F2',
          border: '#C2E5D4',
        },
        warning: {
          DEFAULT: '#D6A14C',
          light: '#FDF8EE',
          border: '#F6E3BE',
        },
        critical: {
          DEFAULT: '#D66B68',
          light: '#FCEEEE',
          border: '#F5C2C0',
        },
        border: {
          DEFAULT: '#E6E9EF',
          subtle: '#EEF1F6',
          strong: '#D3D8E2',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        card: '0 2px 8px -2px rgba(20, 30, 50, 0.06), 0 1px 3px -1px rgba(20, 30, 50, 0.04)',
        elevated: '0 10px 25px -5px rgba(20, 30, 50, 0.08), 0 8px 10px -6px rgba(20, 30, 50, 0.04)',
        highlight: '0 0 0 2px rgba(214, 107, 104, 0.25)',
      }
    },
  },
  plugins: [],
}

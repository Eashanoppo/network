/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        warm: '#F4F5F0',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EFEFE9',
          warm: '#F4F5F0',
          elevated: '#FFFFFF',
        },
        ink: {
          primary: '#151515',
          secondary: '#686862',
          muted: '#92928A',
          inverse: '#FFFFFF',
        },
        brand: {
          DEFAULT: '#F26522', // Vibrant SaaS Orange
          hover: '#DE5413',
          orange: '#F26522',
          light: '#FFF4ED',  // Soft Orange Surface
          border: '#FFD3BC', // Subtle Orange Border
          dark: '#C2410C',
        },
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F26522',
          600: '#EA580C',
          700: '#C2410C',
        },
        amber: {
          50: '#FFFCF2',
          100: '#FFF8E7',
          200: '#FFEEC2',
          300: '#FEDF8F',
          400: '#EEAA12',
          500: '#DC9B08',
          600: '#B87E00',
        },
        success: {
          DEFAULT: '#4D9574',
          light: '#EDF7F2',
          border: '#C2E5D4',
        },
        warning: {
          DEFAULT: '#F26522',
          light: '#FFF4ED',
          border: '#FFD3BC',
        },
        critical: {
          DEFAULT: '#BE645A', // Exact Bland AI Terracotta Stat Color (#be645a)
          light: '#FDF2F0',
          border: '#F5C2BC',
        },
        border: {
          DEFAULT: '#E5E6DE', // Exact Bland AI 1px Hairline Border
          subtle: '#ECECE6',
          strong: '#D8D9D4',
          focus: '#151515',
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
      letterSpacing: {
        tightest: '-0.035em',
        tighter: '-0.025em',
        tight: '-0.015em',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(21, 21, 21, 0.04)',
        subtle: '0 1px 3px rgba(21, 21, 21, 0.05), 0 1px 2px rgba(21, 21, 21, 0.03)',
        card: '0 2px 6px -1px rgba(21, 21, 21, 0.05), 0 1px 3px -1px rgba(21, 21, 21, 0.03)',
        elevated: '0 12px 28px -6px rgba(21, 21, 21, 0.08), 0 4px 10px -4px rgba(21, 21, 21, 0.03)',
        highlight: '0 0 0 2px rgba(238, 170, 18, 0.25)',
      }
    },
  },
  plugins: [],
}

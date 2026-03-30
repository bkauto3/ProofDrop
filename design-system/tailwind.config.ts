// ProofDrop — Tailwind Configuration (B3)
// Generated: 2026-03-28 | Tailwind v3 | shadcn/ui .dark class strategy
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      colors: {
        background:     'hsl(var(--background))',
        foreground:     'hsl(var(--foreground))',
        primary: {
          DEFAULT:      'hsl(var(--primary))',
          foreground:   'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:      'hsl(var(--secondary))',
          foreground:   'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:      'hsl(var(--destructive))',
          foreground:   'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT:      'hsl(var(--success))',
          foreground:   'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT:      'hsl(var(--warning))',
          foreground:   'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT:      'hsl(var(--muted))',
          foreground:   'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:      'hsl(var(--accent))',
          foreground:   'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:      'hsl(var(--popover))',
          foreground:   'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:      'hsl(var(--card))',
          foreground:   'hsl(var(--card-foreground))',
        },
        border:         'hsl(var(--border))',
        input:          'hsl(var(--input))',
        ring:           'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '0% center' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundSize: {
        '200': '200%',
      },
      boxShadow: {
        receipt: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

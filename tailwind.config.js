/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        // Neutral / Chrome
        navy: {
          950: 'var(--color-navy-950)',
          900: 'var(--color-navy-900)',
          700: 'var(--color-navy-700)'
        },
        canvas: {
          50: 'var(--color-canvas-50)'
        },
        azure: {
          100: 'var(--color-azure-100)'
        },
        ink: {
          900: 'var(--color-ink-900)'
        },
        // Extend slate with our exact brand values (overrides Tailwind defaults)
        slate: {
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
          500: 'var(--color-slate-500)'
        },
        // Primary
        cobalt: {
          700: 'var(--color-cobalt-700)',
          600: 'var(--color-cobalt-600)',
          100: 'var(--color-cobalt-100)',
          50: 'var(--color-cobalt-50)'
        },
        // Semantic
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        // Commodity accents — only for data-encoding, not UI chrome
        metal: {
          gold: 'var(--color-metal-gold)',
          copper: 'var(--color-metal-copper)',
          silver: 'var(--color-metal-silver)',
          zinc: 'var(--color-metal-zinc)',
          cobalt: 'var(--color-metal-cobalt)'
        }
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        // §3 Type scale — in-app tokens
        'heading-m': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-s': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-m': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-s': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.04em' }],
        'data-m': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'data-l': ['28px', { lineHeight: '32px', fontWeight: '600' }]
      },
      borderRadius: {
        // §5.1 Cards, §5.2 Buttons
        card: '12px',
        btn: '8px',
        badge: '9999px'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)'
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}

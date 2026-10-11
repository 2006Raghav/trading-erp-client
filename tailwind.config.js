/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        // Neutral / Chrome (BRAND_GUIDE §2.1)
        navy: {
          950: 'var(--color-navy-950)',
          900: 'var(--color-navy-900)',
          800: 'var(--color-navy-800)',
          700: 'var(--color-navy-700)'
        },
        abyss: {
          950: 'var(--color-abyss-950)',
          900: 'var(--color-abyss-900)'
        },
        canvas: {
          50: 'var(--color-canvas-50)',
          DEFAULT: 'var(--bg-canvas)'
        },
        azure: {
          100: 'var(--color-azure-100)'
        },
        ink: {
          900: 'var(--color-ink-900)'
        },
        // Extend slate with exact brand values
        slate: {
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
          400: 'var(--color-slate-400)',
          500: 'var(--color-slate-500)'
        },
        // Primary — Cobalt (BRAND_GUIDE §2.2)
        cobalt: {
          700: 'var(--color-cobalt-700)',
          600: 'var(--color-cobalt-600)',
          500: 'var(--color-cobalt-500)',
          100: 'var(--color-cobalt-100)',
          50: 'var(--color-cobalt-50)'
        },
        // Semantic / Status (BRAND_GUIDE §2.4)
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          text: 'var(--success-text)'
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          text: 'var(--warning-text)'
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          bg: 'var(--color-danger-bg)',
          text: 'var(--danger-text)'
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
          text: 'var(--info-text)'
        },
        // Commodity accents — data-encoding only (BRAND_GUIDE §2.3)
        metal: {
          gold: 'var(--color-metal-gold)',
          copper: 'var(--color-metal-copper)',
          silver: 'var(--color-metal-silver)',
          zinc: 'var(--color-metal-zinc)',
          cobalt: 'var(--color-metal-cobalt)'
        },
        // Semantic Surface & Element Tokens (SPEC §4.3)
        card: {
          DEFAULT: 'var(--bg-card)',
          foreground: 'var(--card-foreground)'
        },
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        pressed: 'var(--bg-pressed)',
        sidebar: {
          DEFAULT: 'var(--bg-sidebar)',
          hover: 'var(--bg-sidebar-hover)',
          border: 'var(--border-sidebar)',
          foreground: 'var(--sidebar-foreground)'
        },
        action: {
          DEFAULT: 'var(--action)',
          hover: 'var(--action-hover)',
          tint: 'var(--action-tint)',
          'tint-strong': 'var(--action-tint-strong)'
        },
        header: {
          bg: 'var(--header-bg)',
          border: 'var(--header-border)'
        },
        // Shadcn UI compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        input: 'var(--input)',
        ring: 'var(--ring)'
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)'
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        strong: 'var(--border-strong)',
        sidebar: 'var(--border-sidebar)'
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

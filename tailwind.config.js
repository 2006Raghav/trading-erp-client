// tailwind.config.js
// CJS format — required by electron-vite's build pipeline.
// Do NOT convert to ESM (export default) or Tailwind will not be found.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind which files to scan for class names.
  // It only generates CSS for classes it finds — this keeps the bundle small.
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        // Primary brand color scale — blue family.
        // Use brand-600 for primary buttons, brand-900 for sidebar,
        // brand-500 for focus rings and active states.
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms') // Resets form element styles for consistent cross-browser look
  ]
}

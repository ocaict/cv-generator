/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
  // Safelist dynamic classes used in JS template previews and injected HTML
  safelist: [
    // Dynamic color injection in preview
    { pattern: /^(bg|text|border)-(indigo|slate|gray|white|black|green|amber|red|orange|sky|rose|emerald|violet)-(50|100|200|300|400|500|600|700|800|900)(\/\d+)?$/ },
    // Arbitrary values used in templates
    { pattern: /^(bg|text|border)-\[.*\]$/ },
    { pattern: /^(w|h|p|m|px|py|mx|my|gap|space|text|rounded|translate)-\[.*\]$/ },
    // Animation classes
    'animate-pulse', 'animate-spin', 'animate-fade-in', 'animate-bounce',
    // Dark mode variants (explicit)
    { pattern: /^dark:/, variants: ['dark'] },
    // Flex/grid helpers used dynamically
    'hidden', 'flex', 'grid', 'block', 'inline-block', 'inline-flex',
  ],
};

// ProofDrop — Tailwind Theme Extension (JavaScript format for CJS compatibility)
// Used by translate_prismatic_output.py as a secondary Tailwind source
/** @type {import('tailwindcss').Config['theme']} */
module.exports = {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    },
    colors: {
      primary: {
        50:  'hsl(220, 91%, 97%)',
        100: 'hsl(220, 91%, 95%)',
        500: 'hsl(220, 91%, 54%)',
        600: 'hsl(220, 83%, 45%)',
        700: 'hsl(220, 83%, 39%)',
      },
      success: {
        100: 'hsl(142, 72%, 94%)',
        500: 'hsl(142, 72%, 36%)',
        600: 'hsl(142, 62%, 30%)',
      },
      error: {
        100: 'hsl(0, 86%, 95%)',
        500: 'hsl(0, 86%, 50%)',
        600: 'hsl(0, 78%, 42%)',
      },
    },
    backgroundSize: {
      '200': '200%',
    },
  },
}

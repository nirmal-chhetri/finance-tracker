/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F5F1E8', // Heavy unbleached rag paper
          subtle: '#ECE6D8',  // Ruled line tint / subdued paper
          card: '#FCFAF5',    // Crisp ledger paper folio sheet
          border: '#D7CEBE',  // 1px crisp ruled ink guide line
          hover: '#EAE3D3',   // Subtle paper hover tint
          dark: '#1C1A17',    // Leather / linen spine binding
        },
        ink: {
          primary: '#161513',   // Deep iron gall archival black ink
          secondary: '#48433B', // Carbon pencil graphite
          muted: '#857D71',     // Faint notation ink
          faint: '#C8BEAF',     // Faint guide grid rule
        },
        brand: {
          green: '#1A5333',     // Ledger credit / asset / surplus spruce green
          red: '#9E2428',       // Ledger debit / liability / deficit carmine red
          blue: '#1E4268',      // Fountain pen archival blue
          amber: '#96681C',     // Aged brass / wax seal gold
          purple: '#5A2A48',    // Royal archival folio violet
        },
        ledger: {
          paper: '#FCFAF5',
          parchment: '#F5F1E8',
          ruled: '#D7CEBE',
          ruledDark: '#161513',
          spine: '#1C1A17',
          spineBorder: '#322E29',
          gold: '#96681C',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif'
        ],
        serif: [
          'Newsreader',
          'Georgia',
          'Cambria',
          'serif'
        ],
        masthead: [
          'Cinzel',
          '"Times New Roman"',
          'serif'
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'monospace'
        ]
      },
      boxShadow: {
        'subtle': '1px 1px 0px rgba(22, 21, 19, 0.08)',
        'card': '1px 1px 0px rgba(22, 21, 19, 0.12)',
        'pressed': 'inset 1px 1px 2px rgba(22, 21, 19, 0.15)',
        'modal': '4px 4px 0px rgba(22, 21, 19, 0.4), 0 0 0 1px #161513',
      }
    },
  },
  plugins: [],
}


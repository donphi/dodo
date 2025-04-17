// See .roo/rules-ui-ux-specialist/01_tailwind_configuration_management.md for theming protocol.
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./tempate_components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Form container width tokens for consistent sizing across components
      maxWidth: {
        'form': '480px',  // Default desktop width for forms
        'breadcrumbs': '440px',  // Width for breadcrumbs component
      },
      keyframes: {
        backArrowTwice: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(0)' },
          '75%': { transform: 'translateX(-5px)' }
        }
      },
      animation: {
        'backArrowTwice': 'backArrowTwice 1.5s ease-in-out'
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#333',
            a: {
              color: '#3182ce',
              '&:hover': {
                color: '#2c5282',
              },
            },
            h1: {
              color: '#1a202c',
            },
            h2: {
              color: '#1a202c',
            },
            h3: {
              color: '#1a202c',
            },
            strong: {
              color: '#1a202c',
            },
            code: {
              color: '#1a202c',
            },
            blockquote: {
              color: '#1a202c',
            },
          },
        },
        dark: {
          css: {
            color: '#e2e8f0',
            a: {
              color: '#90cdf4',
              '&:hover': {
                color: '#63b3ed',
              },
            },
            h1: {
              color: '#f7fafc',
            },
            h2: {
              color: '#f7fafc',
            },
            h3: {
              color: '#f7fafc',
            },
            h4: {
              color: '#f7fafc',
            },
            h5: {
              color: '#f7fafc',
            },
            h6: {
              color: '#f7fafc',
            },
            strong: {
              color: '#f7fafc',
            },
            code: {
              color: '#f7fafc',
            },
            blockquote: {
              color: '#f7fafc',
            },
            figcaption: {
              color: '#e2e8f0',
            },
            pre: {
              backgroundColor: '#1a202c',
            },
            ol: {
              color: '#e2e8f0',
            },
            ul: {
              color: '#e2e8f0',
            },
            li: {
              color: '#e2e8f0',
            },
            p: {
              color: '#e2e8f0',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
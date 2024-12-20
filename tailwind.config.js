/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'zenon-primary': '#B22222',
        'zenon-primary-hover': '#8B0000',
        'zenon-light-bg': '#FFFFFF',
        'zenon-light-card': '#EAEBEC',
        'zenon-light-text': '#212529',
        'zenon-dark-bg': '#121316',
        'zenon-dark-card': '#2C2C2C',
        'zenon-dark-text': '#E9ECEF',
      },
      borderRadius: {
        'zenon': '34px',
        'input': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      keyframes: {
        overlayShow: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        overlayHide: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        modalShow: {
          '0%': { 
            opacity: '0',
            transform: 'translate(calc(var(--trigger-left) - 50vw - 50%), calc(var(--trigger-top) - 50vh - 50%)) scale(0.5)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
        modalHide: {
          '0%': { 
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
          '100%': { 
            opacity: '0',
            transform: 'translate(calc(var(--trigger-left) - 50vw - 50%), calc(var(--trigger-top) - 50vh - 50%)) scale(0.5)',
          },
        },
        'slide-down': {
          '0%': { transform: 'translate(-50%, -100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      animation: {
        overlayShow: 'overlayShow 250ms ease-out',
        overlayHide: 'overlayHide 200ms ease-in',
        modalShow: 'modalShow 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        modalHide: 'modalHide 200ms ease-in',
        'slide-down': 'slide-down 0.3s ease-out forwards',
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 3s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      transitionTimingFunction: {
        'modal': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '700': '700ms',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette principale rouge/bordeaux
        primary: {
          darkest: '#250902',  // Presque noir
          darker: '#38040E',   // Bordeaux très foncé
          dark: '#640D14',     // Rouge foncé
          DEFAULT: '#800E13',  // Rouge moyen
          light: '#AD2831',    // Rouge vif
        },
        // Grays pour les backgrounds
        gray: {
          750: '#283244',
          850: '#1a1a1a',
          900: '#0f0f0f',
          950: '#080808',
        }
      },
      backgroundImage: {
        // Gradients prédéfinis
        'gradient-primary': 'linear-gradient(135deg, #640D14 0%, #AD2831 100%)',
        'gradient-dark': 'linear-gradient(135deg, #250902 0%, #640D14 100%)',
        'gradient-glow': 'linear-gradient(135deg, #38040E 0%, #800E13 50%, #AD2831 100%)',
        'gradient-radial': 'radial-gradient(circle, #AD2831 0%, #640D14 50%, #250902 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(173, 40, 49, 0.5)',
        'glow-red-lg': '0 0 40px rgba(173, 40, 49, 0.6)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
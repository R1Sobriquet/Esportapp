/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00F5FF',
          violet: '#7C3AED',
          violetLight: '#A78BFA',
        },
        gaming: {
          dark: '#050505',
          surface: '#0D0D0D',
          card: '#111111',
        },
        primary: {
          darkest: '#250902',
          darker: '#38040E',
          dark: '#640D14',
          DEFAULT: '#800E13',
          light: '#AD2831',
        },
        gray: {
          750: '#283244',
          850: '#1a1a1a',
          900: '#0f0f0f',
          950: '#080808',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #640D14 0%, #AD2831 100%)',
        'gradient-dark': 'linear-gradient(135deg, #250902 0%, #640D14 100%)',
        'gradient-glow': 'linear-gradient(135deg, #38040E 0%, #800E13 50%, #AD2831 100%)',
        'gradient-radial': 'radial-gradient(circle, #AD2831 0%, #640D14 50%, #250902 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00F5FF 0%, #7C3AED 100%)',
        'gradient-neon-subtle': 'linear-gradient(135deg, rgba(0,245,255,0.12) 0%, rgba(124,58,237,0.12) 100%)',
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(173, 40, 49, 0.5)',
        'glow-red-lg': '0 0 40px rgba(173, 40, 49, 0.6)',
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.4)',
        'glow-cyan-lg': '0 0 40px rgba(0, 245, 255, 0.6)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-light': '0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'fadeIn': 'fadeIn 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
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
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(173, 40, 49, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(173, 40, 49, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 245, 255, 0.3), 0 0 20px rgba(0, 245, 255, 0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.7), 0 0 40px rgba(0, 245, 255, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}

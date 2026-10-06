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
        // Custom 5-Color Aerospace Palette
        void: '#0B0C10',         // Primary Background
        'deep-slate': '#1F2833', // Secondary Background
        starlight: '#C5C6C7',    // Primary Text
        lunar: '#8899A6',
        'electric-cyan': '#66FCF1', // Primary Accent
        'ice-blue': '#45A29E',      // Secondary Accent
        'nebula-violet': '#45A29E', // Ice Blue fallback replacing purple

        space: {
          950: '#0B0C10', // Void Black
          900: '#1F2833', // Dark Starlight
          850: '#19222D',
          800: '#1F2833',
          750: '#2A3645',
          700: '#38485A',
          600: '#45A29E',
          500: '#66FCF1',
        },
        light: {
          bg: '#F4F7FA',
          surface: '#FFFFFF',
          elevated: '#F8FAFC',
          border: '#D9E2EC',
          text: '#0F172A',
          secondary: '#475569',
          brand: '#45A29E',
          cyan: '#66FCF1',
          warning: '#D97706',
        },
        // Strict Semantic Colors
        fact: {
          DEFAULT: '#10B981', // GREEN = OBSERVED FACT
          light: '#34D399',
          dark: '#059669',
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        inference: {
          DEFAULT: '#45A29E', // ICE BLUE = INFERENCE / AI
          light: '#66FCF1',
          dark: '#35827E',
          bg: 'rgba(69, 162, 158, 0.08)',
          border: 'rgba(69, 162, 158, 0.3)',
        },
        recommendation: {
          DEFAULT: '#66FCF1', // ELECTRIC CYAN = RECOMMENDATION
          light: '#88FFF8',
          dark: '#45A29E',
          bg: 'rgba(102, 252, 241, 0.08)',
          border: 'rgba(102, 252, 241, 0.3)',
        },
        critical: {
          DEFAULT: '#EF4444', // RED = CRITICAL / FAILURE
          light: '#F87171',
          dark: '#DC2626',
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        system: {
          DEFAULT: '#66FCF1', // CYAN = SYSTEM / INTERACTION
          bright: '#66FCF1',
          light: '#88FFF8',
          dark: '#45A29E',
          bg: 'rgba(102, 252, 241, 0.08)',
          border: 'rgba(102, 252, 241, 0.3)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Space Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        tech: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(102, 252, 241, 0.3)',
        'cyan-glow-lg': '0 0 35px rgba(102, 252, 241, 0.5)',
        'violet-glow': '0 0 20px rgba(69, 162, 158, 0.3)',
        'ice-glow': '0 0 20px rgba(69, 162, 158, 0.3)',
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
        'red-glow': '0 0 25px rgba(239, 68, 68, 0.35)',
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(102, 252, 241, 0.05)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(102, 252, 241, 0.12) 1px, transparent 1px)",
        'radar-grid': "linear-gradient(to right, rgba(31, 40, 51, 0.8), rgba(31, 40, 51, 0.8)), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(102, 252, 241, 0.04) 20px)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-spin': 'spin 12s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}


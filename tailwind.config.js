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
        space: {
          950: '#040711',
          900: '#070A11',
          850: '#0B0F19',
          800: '#0F172A',
          750: '#151D33',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
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
          DEFAULT: '#F59E0B', // AMBER = INFERENCE
          light: '#FBBF24',
          dark: '#D97706',
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.3)',
        },
        recommendation: {
          DEFAULT: '#3B82F6', // BLUE = RECOMMENDATION
          light: '#60A5FA',
          dark: '#2563EB',
          bg: 'rgba(59, 130, 246, 0.08)',
          border: 'rgba(59, 130, 246, 0.3)',
        },
        critical: {
          DEFAULT: '#EF4444', // RED = CRITICAL / FAILURE
          light: '#F87171',
          dark: '#DC2626',
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.3)',
        },
        system: {
          DEFAULT: '#06B6D4', // CYAN = SYSTEM / INTERACTION
          bright: '#00F0FF',
          light: '#38BDF8',
          dark: '#0891B2',
          bg: 'rgba(6, 182, 212, 0.08)',
          border: 'rgba(6, 182, 212, 0.3)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Space Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        tech: ['Rajdhani', 'Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(6, 182, 212, 0.25)',
        'cyan-glow-lg': '0 0 35px rgba(0, 240, 255, 0.35)',
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
        'red-glow': '0 0 25px rgba(239, 68, 68, 0.35)',
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(6, 182, 212, 0.05)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px)",
        'radar-grid': "linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(56, 189, 248, 0.04) 20px)",
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

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
        // Void Black & Deep Orbital Slate
        void: '#0B0F19',
        'deep-slate': '#111827',
        starlight: '#F8FAFC',
        lunar: '#94A3B8',
        'electric-cyan': '#06B6D4',
        'nebula-violet': '#8B5CF6',

        space: {
          950: '#0B0F19', // Void Black
          900: '#111827', // Deep Orbital Slate
          850: '#161F30',
          800: '#1F2937',
          750: '#283548',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
        },
        light: {
          bg: '#F4F7FA',
          surface: '#FFFFFF',
          elevated: '#F8FAFC',
          border: '#D9E2EC',
          text: '#0F172A',
          secondary: '#475569',
          brand: '#7C3AED',
          cyan: '#0284C7',
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
          DEFAULT: '#8B5CF6', // NEBULA VIOLET = INFERENCE / AI
          light: '#A78BFA',
          dark: '#7C3AED',
          bg: 'rgba(139, 92, 246, 0.08)',
          border: 'rgba(139, 92, 246, 0.3)',
        },
        recommendation: {
          DEFAULT: '#06B6D4', // CYAN = RECOMMENDATION
          light: '#38BDF8',
          dark: '#0891B2',
          bg: 'rgba(6, 182, 212, 0.08)',
          border: 'rgba(6, 182, 212, 0.3)',
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
        'violet-glow': '0 0 20px rgba(139, 92, 246, 0.25)',
        'green-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
        'amber-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
        'red-glow': '0 0 25px rgba(239, 68, 68, 0.35)',
        'card-glow': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 10px 0 rgba(6, 182, 212, 0.05)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(6, 182, 212, 0.12) 1px, transparent 1px)",
        'radar-grid': "linear-gradient(to right, rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(6, 182, 212, 0.04) 20px)",
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

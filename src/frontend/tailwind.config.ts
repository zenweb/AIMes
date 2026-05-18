import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './src/**/*.{vue,js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        slatepanel: '#0f172a',
        mesgreen: '#22c55e',
      },
      fontFamily: {
        sans: ['Fira Sans', 'Segoe UI', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

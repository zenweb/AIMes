import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:5147'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br', threshold: 10240 }),
    viteCompression({ algorithm: 'gzip', ext: '.gz', threshold: 10240 }),
  ],
  base: '/scheduling/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('dhtmlx-gantt')) return 'gantt'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})

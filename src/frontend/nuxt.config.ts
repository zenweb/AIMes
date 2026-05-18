const apiTarget = process.env.VITE_API_TARGET ?? process.env.NUXT_API_TARGET ?? 'http://localhost:5147'

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  app: {
    baseURL: '/scheduling/',
    head: {
      title: 'AIMes AI MES',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  alias: {
    '@': '/src',
  },
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/tailwind.css',
  ],
  modules: ['@nuxtjs/tailwindcss'],
  vite: {
    server: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/hubs': { target: apiTarget, changeOrigin: true, ws: true },
      },
    },
    build: {
      sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('dhtmlx-gantt')) return 'gantt'
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
  },
  nitro: {
    devProxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/hubs': { target: apiTarget, changeOrigin: true, ws: true },
    },
  },
  compatibilityDate: '2026-05-18',
})

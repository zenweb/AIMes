import { fileURLToPath } from 'node:url'
import { createBackendProxyConfig, resolveApiTarget } from './src/config/backend-proxy'

const apiTarget = resolveApiTarget()
const backendProxy = createBackendProxyConfig(apiTarget)
const buildDir = process.env.NUXT_BUILD_DIR ?? '.nuxt'
const nitroOutputDir = process.env.NITRO_OUTPUT_DIR
const vueSharedPath = fileURLToPath(new URL('./node_modules/@vue/shared/dist/shared.esm-bundler.js', import.meta.url))

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  buildDir,
  routeRules: backendProxy.routeRules,
  app: {
    baseURL: '/scheduling/',
    head: {
      title: 'AIMes AI MES',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', href: '/scheduling/favicon.ico' },
      ],
    },
  },
  alias: {
    '@': '/src',
    '@vue/shared': vueSharedPath,
  },
  css: [
    'primeicons/primeicons.css',
    '~/assets/styles/tailwind.css',
  ],
  modules: ['@nuxtjs/tailwindcss'],
  vite: {
    server: {
      proxy: backendProxy.viteProxy,
    },
    build: {
      sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        // T-36 (D 类工程债)：抑制 @microsoft/signalr 上游 `/*#__PURE__*/` 注释位置警告。
        // 上游问题，与本仓库代码无关；保留事件级日志能力以避免掩盖真问题。
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'INVALID_ANNOTATION' &&
            typeof warning.id === 'string' &&
            warning.id.includes('@microsoft/signalr')
          ) {
            return
          }
          defaultHandler(warning)
        },
        output: {
          // T-36：dhtmlx-gantt / signalr / qrcode 是独立的可拆分大包；
          // Vue 单独拆出，降低 vendor 体积；PrimeVue 留在 vendor 以避免循环 chunk 依赖。
          manualChunks(id) {
            if (id.includes('dhtmlx-gantt')) return 'gantt'
            if (id.includes('@microsoft/signalr')) return 'signalr'
            if (id.includes('html5-qrcode') || id.includes('qrcode')) return 'qrcode'
            if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) return 'vue'
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
  },
  nitro: {
    ...(nitroOutputDir
      ? {
          output: {
            dir: nitroOutputDir,
            serverDir: `${nitroOutputDir}/server`,
            publicDir: `${nitroOutputDir}/public`,
          },
        }
      : {}),
    devProxy: {
      ...backendProxy.nitroDevProxy,
    },
  },
  compatibilityDate: '2026-05-18',
})

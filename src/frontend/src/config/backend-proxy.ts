export const defaultApiTarget = 'http://localhost:5003'

export function resolveApiTarget(env: NodeJS.ProcessEnv = process.env): string {
  return env.VITE_API_TARGET ?? env.NUXT_API_TARGET ?? defaultApiTarget
}

export function createBackendProxyConfig(apiTarget: string) {
  const viteProxy = {
    '/api': { target: apiTarget, changeOrigin: true },
    '/hubs': { target: apiTarget, changeOrigin: true, ws: true },
  }

  return {
    routeRules: {
      '/api/**': { proxy: `${apiTarget}/api/**` },
      '/hubs/**': { proxy: `${apiTarget}/hubs/**` },
    },
    viteProxy,
    nitroDevProxy: viteProxy,
  }
}

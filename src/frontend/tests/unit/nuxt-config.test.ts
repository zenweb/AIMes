import { describe, expect, it } from 'vitest'
import { createBackendProxyConfig, defaultApiTarget, resolveApiTarget } from '../../src/config/backend-proxy'

describe('nuxt preview proxy config', () => {
  it('keeps production preview API and SignalR calls live on the 5003 backend by default', () => {
    const config = createBackendProxyConfig(defaultApiTarget)

    expect(defaultApiTarget).toBe('http://localhost:5003')
    expect(config.routeRules).toEqual({
      '/api/**': { proxy: 'http://localhost:5003/api/**' },
      '/hubs/**': { proxy: 'http://localhost:5003/hubs/**' },
    })
    expect(config.viteProxy).toEqual({
      '/api': { target: 'http://localhost:5003', changeOrigin: true },
      '/hubs': { target: 'http://localhost:5003', changeOrigin: true, ws: true },
    })
    expect(config.nitroDevProxy).toEqual(config.viteProxy)
  })

  it('allows CI and staging to override the backend target without changing proxy shape', () => {
    const config = createBackendProxyConfig(resolveApiTarget({ NUXT_API_TARGET: 'http://127.0.0.1:5004' }))

    expect(config.routeRules['/api/**'].proxy).toBe('http://127.0.0.1:5004/api/**')
    expect(config.routeRules['/hubs/**'].proxy).toBe('http://127.0.0.1:5004/hubs/**')
    expect(config.viteProxy['/api'].target).toBe('http://127.0.0.1:5004')
    expect(config.nitroDevProxy['/hubs']).toEqual({
      target: 'http://127.0.0.1:5004',
      changeOrigin: true,
      ws: true,
    })
  })
})

import { describe, expect, it } from 'vitest'
import { resolveSignalRHubUrl } from '../../src/utils/signalr-url'

describe('resolveSignalRHubUrl', () => {
  it('uses the live 5003 backend for standalone 4173 production preview hubs', () => {
    const url = resolveSignalRHubUrl('/hubs/notifications', {
      protocol: 'http:',
      hostname: '127.0.0.1',
      origin: 'http://127.0.0.1:4173',
      port: '4173',
    } as Location)

    expect(url).toBe('http://127.0.0.1:5003/hubs/notifications')
  })

  it('keeps same-origin hubs when the app is served by the backend host', () => {
    const url = resolveSignalRHubUrl('/hubs/monitoring', {
      protocol: 'http:',
      hostname: '127.0.0.1',
      origin: 'http://127.0.0.1:5003',
      port: '5003',
    } as Location)

    expect(url).toBe('/hubs/monitoring')
  })
})

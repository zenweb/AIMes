import { describe, expect, it } from 'vitest'
import { resolveSignalRHubUrl } from '../../src/utils/signalr-url'

describe('resolveSignalRHubUrl', () => {
  it('uses the configured live backend target for standalone preview hubs', () => {
    const url = resolveSignalRHubUrl('/hubs/notifications', {
      protocol: 'http:',
      hostname: '127.0.0.1',
      origin: 'http://127.0.0.1:4173',
      port: '4173',
    } as Location, 'http://127.0.0.1:5002')

    expect(url).toBe('http://127.0.0.1:5002/hubs/notifications')
  })

  it('keeps standalone preview hubs same-origin when no backend target is configured', () => {
    const url = resolveSignalRHubUrl('/hubs/notifications', {
      protocol: 'http:',
      hostname: '127.0.0.1',
      origin: 'http://127.0.0.1:4173',
      port: '4173',
    } as Location, '')

    expect(url).toBe('/hubs/notifications')
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

import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import { getLocalAccessToken } from '../../src/utils/auth-token'

describe('auth token parsing', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
  })

  it('ignores blank access tokens so realtime connections do not send unusable credentials', () => {
    localStorage.setItem('aimes_token', '   ')

    expect(getLocalAccessToken()).toBeNull()
  })

  it('normalizes access token whitespace before HTTP and realtime credential injection', () => {
    localStorage.setItem('aimes_token', '  access-token  ')

    expect(getLocalAccessToken()).toBe('access-token')
  })
})

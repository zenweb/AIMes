import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, login, refresh } from '../../src/api/auth'

const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    post: httpPost,
  },
}))

describe('auth api', () => {
  beforeEach(() => {
    httpPost.mockReset()
  })

  it('maps login to the backend auth contract and returns the response body unchanged', async () => {
    const request = {
      username: 'admin',
      password: 'admin123',
    }
    const response = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      username: 'admin',
      displayName: '管理员',
      role: 'Admin',
      expiresAt: '2026-06-22T10:00:00Z',
      mustChangePassword: false,
    }
    httpPost.mockResolvedValueOnce({ data: response })

    await expect(login(request)).resolves.toBe(response)

    expect(httpPost).toHaveBeenCalledWith('/auth/login', request)
  })

  it('maps password changes to the backend endpoint without leaking a response body contract', async () => {
    const request = {
      username: 'operator',
      currentPassword: 'old-password',
      newPassword: 'new-password',
    }
    httpPost.mockResolvedValueOnce({ data: { ignored: true } })

    await expect(changePassword(request)).resolves.toBeUndefined()

    expect(httpPost).toHaveBeenCalledWith('/auth/change-password', request)
  })

  it('rotates refresh tokens through the backend refresh endpoint and returns the new pair unchanged', async () => {
    const response = {
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: '2026-06-22T11:00:00Z',
    }
    httpPost.mockResolvedValueOnce({ data: response })

    await expect(refresh('old-refresh-token')).resolves.toBe(response)

    expect(httpPost).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'old-refresh-token',
    })
  })
})

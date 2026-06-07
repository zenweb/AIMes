import http from './http'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  username: string
  displayName: string
  role: string
  expiresAt: string
  mustChangePassword: boolean
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresAt: string
}

export interface ChangePasswordRequest {
  username: string
  currentPassword: string
  newPassword: string
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', request)
  return data
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await http.post('/auth/change-password', request)
}

/**
 * 用 refresh token 换新 access token + 新 refresh token（rotation）。
 * 后端在签发新 pair 时会删旧 refresh token，所以一次性消费。
 */
export async function refresh(refreshToken: string): Promise<RefreshTokenResponse> {
  const { data } = await http.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
  return data
}

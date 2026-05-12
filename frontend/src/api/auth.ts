import axios from 'axios'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  displayName: string
  role: string
  expiresAt: string
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>('/api/v1/auth/login', request)
  return data
}

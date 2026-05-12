import axios from 'axios'
import type { RiskDashboardDto } from '../types/risk'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('aimes_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function getRiskDashboard(): Promise<RiskDashboardDto> {
  const { data } = await http.get<RiskDashboardDto>('/risk/dashboard')
  return data
}

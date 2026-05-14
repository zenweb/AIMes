import http from './http'
import type { RiskDashboardDto } from '../types/risk'

export async function getRiskDashboard(): Promise<RiskDashboardDto> {
  const { data } = await http.get<RiskDashboardDto>('/risk/dashboard')
  return data
}

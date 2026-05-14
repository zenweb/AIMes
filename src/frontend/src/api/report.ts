import http from './http'
import type { ReportDashboard } from '../types/report'

export async function getReportDashboard(): Promise<ReportDashboard> {
  const { data } = await http.get<ReportDashboard>('/report/dashboard')
  return data
}

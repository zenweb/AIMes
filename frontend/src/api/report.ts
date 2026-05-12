import axios from 'axios'
import type { ReportDashboard } from '../types/report'

const http = axios.create({ baseURL: '/api/v1', timeout: 30000 })

export async function getReportDashboard(): Promise<ReportDashboard> {
  const { data } = await http.get<ReportDashboard>('/report/dashboard')
  return data
}

import http from './http'
import type { PagedResult } from '../types/common'
import type { ProductionAnomaly, ProductionAnomalyDetail, AnalyzeAnomalyResult } from '../types/anomaly'

const BASE = '/anomaly'

export async function getAnomalyList(page = 1, pageSize = 20): Promise<PagedResult<ProductionAnomaly>> {
  const { data } = await http.get<PagedResult<ProductionAnomaly>>(BASE, { params: { page, pageSize } })
  return data
}

export async function getCriticalAnomalies(): Promise<ProductionAnomaly[]> {
  const { data } = await http.get(`${BASE}/critical`)
  return data
}

export async function getAnomalyById(id: string): Promise<ProductionAnomalyDetail> {
  const { data } = await http.get(`${BASE}/${id}`)
  return data
}

export async function analyzeAnomaly(id: string): Promise<AnalyzeAnomalyResult> {
  const { data } = await http.post(`${BASE}/${id}/analyze`)
  return data
}

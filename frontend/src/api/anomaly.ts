import axios from 'axios'
import type { ProductionAnomaly, ProductionAnomalyDetail, AnalyzeAnomalyResult } from '../types/anomaly'

const BASE = '/api/v1/anomaly'

export async function getAnomalyList(): Promise<ProductionAnomaly[]> {
  const { data } = await axios.get(BASE)
  return data
}

export async function getCriticalAnomalies(): Promise<ProductionAnomaly[]> {
  const { data } = await axios.get(`${BASE}/critical`)
  return data
}

export async function getAnomalyById(id: string): Promise<ProductionAnomalyDetail> {
  const { data } = await axios.get(`${BASE}/${id}`)
  return data
}

export async function analyzeAnomaly(id: string): Promise<AnalyzeAnomalyResult> {
  const { data } = await axios.post(`${BASE}/${id}/analyze`)
  return data
}

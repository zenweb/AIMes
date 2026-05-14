import http from './http'
import type { InspectionDto, QualityStatisticsDto, RootCauseAnalysisDto, SpcAnalysisDto } from '../types/quality'

export async function getInspections(workOrderId?: string): Promise<InspectionDto[]> {
  const url = workOrderId
    ? `/quality/inspections/workorder/${workOrderId}`
    : '/quality/inspections'
  const { data } = await http.get<InspectionDto[]>(url)
  return data
}

export async function getInspectionById(id: string): Promise<InspectionDto> {
  const { data } = await http.get<InspectionDto>(`/quality/inspections/${id}`)
  return data
}

export async function getQualityStatistics(productCode?: string): Promise<QualityStatisticsDto> {
  const { data } = await http.get<QualityStatisticsDto>('/quality/statistics', {
    params: productCode ? { productCode } : undefined,
  })
  return data
}

export async function analyzeRootCause(inspectionId: string): Promise<RootCauseAnalysisDto> {
  const { data } = await http.post<RootCauseAnalysisDto>(
    `/quality/inspections/${inspectionId}/analyze`
  )
  return data
}

export async function analyzeSpcTrend(processParameter: string, windowSize = 20): Promise<SpcAnalysisDto> {
  const { data } = await http.get<SpcAnalysisDto>('/quality/spc/analyze', {
    params: { processParameter, windowSize },
  })
  return data
}

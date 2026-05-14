import http from './http'
import type { WorkOrderDto, OperationInfoDto, OperationResultDto, StartOperationRequest, CompleteOperationRequest, ReportExceptionRequest } from '../types/production'

export async function getWorkOrders(params?: {
  status?: string
  workshopId?: string
  page?: number
  pageSize?: number
}): Promise<{ items: WorkOrderDto[]; totalCount: number }> {
  const { data } = await http.get('/scheduling/workorders', { params })
  return data
}

export async function scanOperation(code: string, operatorId?: string): Promise<OperationInfoDto> {
  const { data } = await http.post<OperationInfoDto>('/production/scan', { code, operatorId })
  return data
}

export async function startOperation(id: string, request: StartOperationRequest): Promise<OperationResultDto> {
  const { data } = await http.post<OperationResultDto>(`/production/operations/${id}/start`, request)
  return data
}

export async function completeOperation(id: string, request: CompleteOperationRequest): Promise<OperationResultDto> {
  const { data } = await http.post<OperationResultDto>(`/production/operations/${id}/complete`, request)
  return data
}

export async function reportException(id: string, request: ReportExceptionRequest): Promise<OperationResultDto> {
  const { data } = await http.post<OperationResultDto>(`/production/operations/${id}/exception`, request)
  return data
}

import axios from 'axios'
import type {
  EquipmentDto, EquipmentStatisticsDto, EquipmentHealthDto,
  DiagnosticReportDto, MaintenanceRecordDto,
} from '../types/equipment'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

export async function getEquipmentList(workshopId?: string, status?: string): Promise<EquipmentDto[]> {
  const { data } = await http.get<EquipmentDto[]>('/equipment', {
    params: { workshopId, status },
  })
  return data
}

export async function getEquipmentById(id: string): Promise<EquipmentDto> {
  const { data } = await http.get<EquipmentDto>(`/equipment/${id}`)
  return data
}

export async function getEquipmentStatistics(workshopId?: string): Promise<EquipmentStatisticsDto> {
  const { data } = await http.get<EquipmentStatisticsDto>('/equipment/statistics', {
    params: workshopId ? { workshopId } : undefined,
  })
  return data
}

export async function getHealthReport(id: string): Promise<EquipmentHealthDto> {
  const { data } = await http.get<EquipmentHealthDto>(`/equipment/${id}/health`)
  return data
}

export async function diagnose(id: string, errorCode?: string): Promise<DiagnosticReportDto> {
  const { data } = await http.post<DiagnosticReportDto>(`/equipment/${id}/diagnose`, { errorCode })
  return data
}

export async function getMaintenanceHistory(id: string): Promise<MaintenanceRecordDto[]> {
  const { data } = await http.get<MaintenanceRecordDto[]>(`/equipment/${id}/maintenance-history`)
  return data
}

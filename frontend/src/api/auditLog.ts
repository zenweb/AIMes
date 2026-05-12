import axios from 'axios'
import type { AuditLog, AuditLogDetail } from '../types/auditLog'

const http = axios.create({ baseURL: '/api/v1', timeout: 30000 })

export async function getAuditLogs(action?: string, page = 1, pageSize = 20): Promise<AuditLog[]> {
  const params: Record<string, string | number> = { page, pageSize }
  if (action) params.action = action
  const { data } = await http.get<AuditLog[]>('/audit-logs', { params })
  return data
}

export async function getAuditLogDetail(id: string): Promise<AuditLogDetail> {
  const { data } = await http.get<AuditLogDetail>(`/audit-logs/${id}`)
  return data
}

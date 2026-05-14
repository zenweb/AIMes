import http from './http'
import type { AuditLog, AuditLogDetail } from '../types/auditLog'
import type { PagedResult } from '../types/common'

export async function getAuditLogs(action?: string, page = 1, pageSize = 20): Promise<PagedResult<AuditLog>> {
  const params: Record<string, string | number> = { page, pageSize }
  if (action) params.action = action
  const { data } = await http.get<PagedResult<AuditLog>>('/audit-logs', { params })
  return data
}

export async function getAuditLogDetail(id: string): Promise<AuditLogDetail> {
  const { data } = await http.get<AuditLogDetail>(`/audit-logs/${id}`)
  return data
}

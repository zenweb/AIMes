export interface AuditLog {
  id: string
  userId: string
  initiatedBy?: string
  action: string
  resource: string
  resourceId: string | null
  businessKey?: string | null
  traceId?: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLog {
  oldValues: string | null
  newValues: string | null
  promptHash?: string | null
  contextHash?: string | null
  ipAddress: string | null
  userAgent: string | null
}

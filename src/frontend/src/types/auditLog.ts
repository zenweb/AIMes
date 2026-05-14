export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  createdAt: string
}

export interface AuditLogDetail extends AuditLog {
  oldValues: string | null
  newValues: string | null
  ipAddress: string | null
  userAgent: string | null
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAuditLogDetail, getAuditLogs } from '../../src/api/auditLog'

const httpGet = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
  },
}))

describe('audit log api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
  })

  it('uses backend paging contract and includes action only when filtering audit logs', async () => {
    const pagedResult = {
      items: [{ id: 'audit-001', action: 'AgentExecutePurchaseAction' }],
      totalCount: 1,
      totalPages: 1,
    }
    httpGet.mockResolvedValueOnce({ data: pagedResult })
    httpGet.mockResolvedValueOnce({ data: { ...pagedResult, items: [] } })

    await expect(getAuditLogs('AgentExecutePurchaseAction', 3, 15)).resolves.toBe(pagedResult)
    await getAuditLogs(undefined, 2, 10)

    expect(httpGet.mock.calls).toEqual([
      ['/audit-logs', { params: { page: 3, pageSize: 15, action: 'AgentExecutePurchaseAction' } }],
      ['/audit-logs', { params: { page: 2, pageSize: 10 } }],
    ])
  })

  it('uses the audit log detail path verbatim so replay evidence resolves by selected audit id', async () => {
    const detail = {
      id: 'audit-po-001',
      action: 'AgentExecutePurchaseAction',
      newValues: '{"traceId":"TRACE-PO-001"}',
    }
    httpGet.mockResolvedValueOnce({ data: detail })

    await expect(getAuditLogDetail('audit-po-001')).resolves.toBe(detail)

    expect(httpGet).toHaveBeenCalledWith('/audit-logs/audit-po-001')
  })
})

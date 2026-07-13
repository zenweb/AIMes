import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuditLogBoard from '../../src/components/auditLog/AuditLogBoard.vue'
import type { AuditLog, AuditLogDetail } from '../../src/types/auditLog'
import { useLocale } from '../../src/composables/useLocale'

const getAuditLogDetail = vi.hoisted(() => vi.fn())
const getAuditLogs = vi.hoisted(() => vi.fn())
const isOfflineDemoError = vi.hoisted(() =>
  vi.fn((error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError'),
)

vi.mock('../../src/api/auditLog', () => ({
  getAuditLogDetail,
  getAuditLogs,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError,
}))

const logs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'admin',
    action: 'POST',
    resource: 'Equipment',
    resourceId: null,
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'audit-2',
    userId: 'operator1',
    action: 'PUT',
    resource: 'Production',
    resourceId: 'wo-001',
    createdAt: '2026-06-01T09:00:00Z',
  },
]

const detail: AuditLogDetail = {
  ...logs[1],
  initiatedBy: 'Agent',
  businessKey: 'WorkOrder:WO-001',
  traceId: 'TRACE-WO-001',
  promptHash: 'prompt-sha256',
  contextHash: 'context-sha256',
  oldValues: '{"status":"Queued"}',
  newValues: '{"status":"Released"}',
  ipAddress: '10.0.0.12',
  userAgent: 'Vitest',
}

function mountAuditLogBoard() {
  return mount(AuditLogBoard, {
    global: {
      stubs: {
        AuditDecisionReplayPanel: true,
      },
    },
  })
}

describe('AuditLogBoard', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/scheduling/audit-logs')
    getAuditLogs.mockResolvedValue({
      items: logs,
      totalCount: logs.length,
      totalPages: 1,
    })
    getAuditLogDetail.mockResolvedValue(detail)
    isOfflineDemoError.mockImplementation(
      (error: unknown) => error instanceof Error && error.name === 'OfflineDemoApiError',
    )
  })

  it('names each detail action with audit context and opens the selected log', async () => {
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    const detailButtons = wrapper.findAll('.btn-sm')
    expect(detailButtons).toHaveLength(2)
    expect(detailButtons[1].attributes('aria-label')).toBe('查看审计日志详情：operator1 更新 Production wo-001')

    await detailButtons[1].trigger('click')
    await flushPromises()

    expect(getAuditLogDetail).toHaveBeenCalledWith('audit-2')
    expect(wrapper.get('.detail-modal').text()).toContain('audit-2')
    expect(wrapper.get('.json-block').text()).toContain('"status": "Released"')
    expect(wrapper.get('.detail-modal').text()).toContain('Agent')
    expect(wrapper.get('.detail-modal').text()).toContain('WorkOrder:WO-001')
    expect(wrapper.get('.detail-modal').text()).toContain('prompt-sha256')
    expect(wrapper.get('.detail-modal').text()).toContain('context-sha256')
  })

  it('filters the list by the trace selected from audit details', async () => {
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    await wrapper.findAll('.btn-sm')[1].trigger('click')
    await flushPromises()
    const traceButton = wrapper.get('.detail-trace-button')
    expect(traceButton.attributes('aria-label')).toBe('筛选同一追踪：TRACE-WO-001')

    await traceButton.trigger('click')
    await flushPromises()

    expect(getAuditLogs).toHaveBeenLastCalledWith(undefined, 1, 20, 'TRACE-WO-001')
    expect(wrapper.find('.detail-modal').exists()).toBe(false)
    expect(window.location.search).toBe('?traceId=TRACE-WO-001')
  })

  it('loads only the trace selected by an audit replay deep link', async () => {
    window.history.replaceState({}, '', '/scheduling/audit-logs?traceId=TRACE-PO-001')
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    expect(getAuditLogs).toHaveBeenCalledWith(undefined, 1, 20, 'TRACE-PO-001')
    expect(wrapper.text()).toContain('operator1')
  })

  it('opens the audit detail selected by an audit replay deep link', async () => {
    window.history.replaceState({}, '', '/scheduling/audit-logs?id=audit-2')
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    expect(getAuditLogDetail).toHaveBeenCalledWith('audit-2')
    expect(wrapper.get('.detail-modal').text()).toContain('audit-2')
  })

  it('reloads audit logs with the selected action filter and resets to the first page', async () => {
    getAuditLogs
      .mockResolvedValueOnce({
        items: logs,
        totalCount: 40,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [logs[1]],
        totalCount: 1,
        totalPages: 1,
      })
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    await wrapper.get('.filter-select').setValue('PUT')
    await flushPromises()

    expect(getAuditLogs).toHaveBeenLastCalledWith('PUT', 1, 20)
    expect(wrapper.text()).toContain('operator1')
    expect(wrapper.text()).toContain('Production')
    expect(wrapper.text()).not.toContain('Equipment')
    expect(wrapper.find('.pagination').exists()).toBe(false)
  })

  it('offers PATCH in the action filter and labels the final table column as details', async () => {
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    const options = wrapper.findAll('.filter-select option').map((option) => option.text())
    expect(options).toContain('PATCH（修改）')
    expect(wrapper.find('thead').findAll('th').at(-1)?.text()).toBe('详情')
  })

  it('loads the next audit page and lets the reviewer close an opened detail modal', async () => {
    getAuditLogs
      .mockResolvedValueOnce({
        items: [logs[0]],
        totalCount: 40,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        items: [logs[1]],
        totalCount: 40,
        totalPages: 2,
      })
    const wrapper = mountAuditLogBoard()
    await flushPromises()

    expect(wrapper.get('.pagination').text()).toContain('第 1 / 2 页')

    await wrapper.findAll('.page-btn')[1].trigger('click')
    await flushPromises()

    expect(getAuditLogs).toHaveBeenLastCalledWith(undefined, 2, 20)
    expect(wrapper.get('.pagination').text()).toContain('第 2 / 2 页')
    expect(wrapper.text()).toContain('operator1')

    await wrapper.get('.btn-sm').trigger('click')
    await flushPromises()
    expect(wrapper.find('.detail-modal').exists()).toBe(true)

    await wrapper.get('.btn-cancel').trigger('click')
    await flushPromises()

    expect(wrapper.find('.detail-modal').exists()).toBe(false)
  })

  it('alerts while showing local demo audit logs when the audit list cannot be loaded', async () => {
    getAuditLogs.mockRejectedValueOnce(new Error('audit list backend unavailable'))

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('审计日志列表加载失败')
    expect(alert.text()).toContain('已显示本地演示日志')
    expect(alert.text()).toContain('audit list backend unavailable')
    expect(wrapper.text()).toContain('operator1')
    expect(wrapper.text()).toContain('Production')
  })

  it('keeps local demo audit logs quiet when offline demo skips audit list backend read', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/audit-logs')
    offlineDemoError.name = 'OfflineDemoApiError'
    getAuditLogs.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('operator1')
    expect(wrapper.text()).toContain('Production')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    expect(wrapper.text()).not.toContain('审计日志列表加载失败')
  })

  it('alerts while showing local demo audit logs when the audit list payload is not an array', async () => {
    getAuditLogs.mockResolvedValueOnce({
      items: { rows: [] },
      totalCount: 1,
      totalPages: 1,
    })

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('审计日志列表加载失败')
    expect(alert.text()).toContain('已显示本地演示日志')
    expect(alert.text()).toContain('后端返回非数组审计日志载荷')
    expect(wrapper.text()).toContain('operator1')
    expect(wrapper.text()).toContain('Production')
  })

  it('alerts while showing local demo audit logs when one audit list item is not a log object', async () => {
    getAuditLogs.mockResolvedValueOnce({
      items: [
        {
          id: 'audit-list-item-shape',
          userId: 'operator1',
          resource: 'Production',
          resourceId: 'wo-001',
          createdAt: '2026-06-01T09:00:00Z',
        },
      ],
      totalCount: 1,
      totalPages: 1,
    })

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('审计日志列表加载失败')
    expect(alert.text()).toContain('已显示本地演示日志')
    expect(alert.text()).toContain('audit-list-item-shape 后端返回非对象审计日志载荷')
    expect(wrapper.text()).toContain('operator1')
    expect(wrapper.text()).toContain('Production')
  })

  it('does not open the detail modal and alerts when audit detail cannot be loaded', async () => {
    getAuditLogDetail.mockRejectedValueOnce(new Error('audit detail backend unavailable'))

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    await wrapper.findAll('.btn-sm')[1].trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('审计日志详情加载失败')
    expect(alert.text()).toContain('audit detail backend unavailable')
    expect(wrapper.find('.detail-modal').exists()).toBe(false)
  })

  it('does not open the detail modal and alerts when audit detail payload is not a detail object', async () => {
    getAuditLogDetail.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditLogBoard()
    await flushPromises()

    await wrapper.findAll('.btn-sm')[1].trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('审计日志详情加载失败')
    expect(alert.text()).toContain('audit-2 后端返回非对象审计详情载荷')
    expect(wrapper.find('.detail-modal').exists()).toBe(false)
  })

  it('renders audit controls in English when the application locale is English', async () => {
    const { setLocale } = useLocale()
    setLocale('en-US')

    try {
      const wrapper = mountAuditLogBoard()
      await flushPromises()

      expect(wrapper.get('.page-title').text()).toBe('Audit Log')
      expect(wrapper.get('.filter-select').text()).toContain('All actions')
      expect(wrapper.findAll('.btn-sm')[1].attributes('aria-label')).toBe(
        'View audit detail: operator1 updated Production wo-001',
      )
      await wrapper.findAll('.btn-sm')[1].trigger('click')
      await flushPromises()
      expect(wrapper.get('.detail-modal').text()).toContain('Initiated by')
      expect(wrapper.get('.detail-modal').text()).toContain('Business key')
      expect(wrapper.get('.detail-modal').text()).toContain('Prompt hash')
      expect(wrapper.get('.detail-trace-button').attributes('aria-label')).toBe('Filter this trace: TRACE-WO-001')
    } finally {
      setLocale('zh-CN')
    }
  })
})

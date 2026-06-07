import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuditLogBoard from '../../src/components/auditLog/AuditLogBoard.vue'
import type { AuditLog, AuditLogDetail } from '../../src/types/auditLog'

const getAuditLogDetail = vi.hoisted(() => vi.fn())
const getAuditLogs = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/auditLog', () => ({
  getAuditLogDetail,
  getAuditLogs,
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
    getAuditLogs.mockResolvedValue({
      items: logs,
      totalCount: logs.length,
      totalPages: 1,
    })
    getAuditLogDetail.mockResolvedValue(detail)
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
      items: [{
        id: 'audit-list-item-shape',
        userId: 'operator1',
        resource: 'Production',
        resourceId: 'wo-001',
        createdAt: '2026-06-01T09:00:00Z',
      }],
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
})

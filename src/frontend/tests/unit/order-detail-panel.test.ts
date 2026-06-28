import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDetailPanel from '../../src/components/schedule/OrderDetailPanel.vue'
import type { WorkOrderDto } from '../../src/types/scheduling'

const order: WorkOrderDto = {
  id: 'wo-001',
  orderNumber: 'WO-001',
  productCode: 'P-001',
  productName: '液压阀体',
  plannedQuantity: 100,
  completedQuantity: 20,
  plannedStartDate: '2026-06-06T08:00:00.000Z',
  plannedEndDate: '2026-06-06T18:00:00.000Z',
  status: 'in_progress',
  priority: 2,
  progressPercentage: 20,
  routeCode: 'CNC-ROUTE',
}

describe('OrderDetailPanel', () => {
  it('exposes the open work order details as a modal dialog with a named close action', () => {
    const wrapper = mount(OrderDetailPanel, {
      props: {
        visible: true,
        loading: false,
        order,
      },
    })

    const panel = wrapper.get('.detail-panel')
    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-modal')).toBe('true')
    expect(panel.attributes('aria-label')).toBe('工单详情：WO-001')

    const close = wrapper.get('.close-btn')
    expect(close.attributes('aria-label')).toBe('关闭工单详情')
  })

  it('emits close and renders custom scheduling explanation evidence for the selected work order', async () => {
    const wrapper = mount(OrderDetailPanel, {
      props: {
        visible: true,
        loading: false,
        order: {
          ...order,
          status: 'scheduled',
          actualStartDate: '2026-06-06T08:30:00.000Z',
        },
        explanation: {
          workOrderNumber: 'WO-001',
          reason: '急单锁定期后插入，保护 CNC 连续加工窗口。',
          risk: '若 M-AL-6061 未按 ETA 到货，需切换替代供应商。',
          alternative: '可转 CNC-02 夜班窗口，并记录人工调整原因。',
          items: [
            {
              label: '交期',
              value: '2026-06-06 18:00',
              detail: '客户承诺交期不可后移。',
            },
            {
              label: '设备',
              value: 'CNC-ROUTE',
              detail: '匹配当前工艺路线设备能力。',
            },
          ],
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('已排产')
    expect(text).toContain('实际开始')
    expect(text).toContain('急单锁定期后插入')
    expect(text).toContain('若 M-AL-6061 未按 ETA 到货')
    expect(text).toContain('可转 CNC-02 夜班窗口')
    expect(text).toContain('客户承诺交期不可后移')

    await wrapper.get('.close-btn').trigger('click')

    expect(wrapper.emitted('close')).toEqual([[]])
  })

  it('shows a polite empty state when no work order is selected', () => {
    const wrapper = mount(OrderDetailPanel, {
      props: {
        visible: false,
        loading: false,
        order: null,
      },
    })

    const panel = wrapper.get('.detail-panel')
    expect(panel.classes()).not.toContain('open')
    expect(panel.attributes('aria-modal')).toBe('false')
    expect(panel.attributes('aria-label')).toBe('工单详情')

    const empty = wrapper.get('.panel-body.empty')
    expect(empty.attributes('role')).toBe('status')
    expect(empty.attributes('aria-live')).toBe('polite')
    expect(empty.text()).toContain('请点击甘特图上的工单查看详情')
  })

  it('falls back to raw status text for unknown backend status values', () => {
    const wrapper = mount(OrderDetailPanel, {
      props: {
        visible: true,
        loading: false,
        order: {
          ...order,
          status: 'blocked_by_material',
        },
      },
    })

    expect(wrapper.get('.status-badge').text()).toBe('blocked_by_material')
    expect(wrapper.text()).toContain('为什么排在这里')
    expect(wrapper.text()).toContain('基于交期、设备能力、前置工序和锁定期保护生成当前排产位置')
  })

  it('announces loading and error states instead of leaving the side panel silent', () => {
    const loadingWrapper = mount(OrderDetailPanel, {
      props: {
        visible: true,
        loading: true,
        order: null,
      },
    })
    const loading = loadingWrapper.get('.panel-body.loading')
    expect(loading.attributes('role')).toBe('status')
    expect(loading.attributes('aria-live')).toBe('polite')

    const errorWrapper = mount(OrderDetailPanel, {
      props: {
        visible: true,
        loading: false,
        error: '工单详情加载失败，已显示本地排产解释兜底',
        order: null,
      },
    })
    const error = errorWrapper.get('.panel-body.error')
    expect(error.attributes('role')).toBe('alert')
    expect(error.attributes('aria-live')).toBe('assertive')
  })
})

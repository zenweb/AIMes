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

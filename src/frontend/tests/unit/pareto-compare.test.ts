import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ParetoCompare from '../../src/components/schedule/ParetoCompare.vue'

const batchOptimize = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/scheduling', () => ({
  batchOptimize,
  getEquipmentList: vi.fn(),
}))

vi.mock('../../src/api/equipment', () => ({
  getBottleneckEquipmentIds: vi.fn(),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  logUnlessOfflineDemo: vi.fn(),
}))

vi.mock('../../src/utils/gantt-mapper', () => ({
  planToGanttData: vi.fn(() => ({ tasks: [], links: [] })),
}))

function mountCompare(visible = true) {
  return mount(ParetoCompare, {
    props: {
      visible,
      workshopId: 'ws-001',
    },
    global: {
      stubs: {
        GanttChart: true,
        Teleport: true,
      },
    },
  })
}

describe('ParetoCompare', () => {
  beforeEach(() => {
    batchOptimize.mockReset()
  })

  it('exposes the objective comparison overlay as a labelled modal dialog', () => {
    const wrapper = mountCompare()

    const dialog = wrapper.get('.compare-container')
    expect(dialog.attributes('role')).toBe('dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe('pareto-compare-title')
    expect(wrapper.get('#pareto-compare-title').text()).toBe('多目标方案对比')
    expect(wrapper.get('.close-btn').attributes('aria-label')).toBe('关闭多目标方案对比')
  })

  it('announces the demo fallback recommendation and emits the selected objective', async () => {
    batchOptimize.mockRejectedValueOnce(new Error('backend unavailable'))
    const wrapper = mountCompare(false)
    await wrapper.setProps({ visible: true })
    await flushPromises()

    const recommendation = wrapper.get('.recommend-card')
    expect(recommendation.attributes('role')).toBe('status')
    expect(recommendation.attributes('aria-live')).toBe('polite')
    expect(recommendation.text()).toContain('推荐方案')
    expect(recommendation.text()).toContain('综合平衡')

    await wrapper.get('.recommend-apply-btn').trigger('click')

    expect(wrapper.emitted('apply')).toEqual([['balanced']])
  })
})

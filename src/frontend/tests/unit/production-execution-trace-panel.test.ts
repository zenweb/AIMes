import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductionExecutionTracePanel, {
  type ProductionExecutionTrace,
} from '../../src/components/production/ProductionExecutionTracePanel.vue'

const traces: ProductionExecutionTrace[] = [
  {
    id: 'trace-start-wo-001',
    type: 'schedule',
    typeLabel: '排产回写',
    title: 'WO-001 已开工',
    detail: 'CNC 精加工 在 ST-001 开工，设备 CNC-002 已占用。',
    tags: ['进度回写', '设备占用', '人员资质'],
    createdAt: '2026-06-06 13:50',
  },
  {
    id: 'trace-risk-wo-001',
    type: 'risk',
    typeLabel: '风险联动',
    title: 'WO-001 异常上报进入风险联动',
    detail: '生产异常已进入 OTD 复盘。',
    tags: ['排产风险', '生产异常'],
    createdAt: '2026-06-06 14:00',
  },
]

describe('ProductionExecutionTracePanel', () => {
  it('exposes execution trace records as a live audit list', () => {
    const wrapper = mount(ProductionExecutionTracePanel, {
      props: {
        traces,
      },
    })

    const panel = wrapper.get('.execution-trace-panel')
    expect(panel.attributes('role')).toBe('status')
    expect(panel.attributes('aria-live')).toBe('polite')
    expect(panel.attributes('aria-label')).toContain('2 条记录')

    const list = wrapper.get('.trace-list')
    expect(list.attributes('role')).toBe('list')
    expect(list.attributes('aria-label')).toBe('生产执行闭环记录')

    const cards = wrapper.findAll('.trace-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].attributes('role')).toBe('listitem')
    expect(cards[0].attributes('aria-label')).toBe('排产回写：WO-001 已开工，2026-06-06 13:50')
    expect(cards[1].attributes('aria-label')).toBe('风险联动：WO-001 异常上报进入风险联动，2026-06-06 14:00')
  })
})

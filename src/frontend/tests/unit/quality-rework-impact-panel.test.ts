import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QualityReworkImpactPanel from '../../src/components/quality/QualityReworkImpactPanel.vue'
import type { QualityReworkImpact } from '../../src/utils/quality-rework-sync'

function event(overrides: Partial<QualityReworkImpact> = {}): QualityReworkImpact {
  return {
    inspectionId: 'INS-003',
    workOrderId: 'WO-003',
    productCode: 'PRD-003',
    processName: '热处理',
    equipmentCode: 'HT-01',
    materialBatchCode: 'MAT-AL6061-B03',
    batchCode: 'WO-003-HEAT',
    inspectionPoint: '硬度检验',
    defectQuantity: 3,
    reworkHours: 6,
    otdImpact: 'WO-003 延期 +1 单风险',
    recommendedAction: '建议插入返工与复验窗口。',
    rootCause: '硬度不足 / 热处理参数漂移',
    evidence: ['硬度检验 检验结果 rework', 'HT-01 关联工序 热处理'],
    createdAt: '2026-05-21T09:00:00.000Z',
    ...overrides,
  }
}

describe('QualityReworkImpactPanel', () => {
  it('names the create action with the affected work order and inspection', () => {
    const wrapper = mount(QualityReworkImpactPanel, {
      props: {
        event: event(),
        syncMessage: '',
      },
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('生成返工排产事件：WO-003 INS-003')
  })

  it('announces rework sync evidence as a polite status update', () => {
    const wrapper = mount(QualityReworkImpactPanel, {
      props: {
        event: event(),
        syncMessage: '返工排产事件已生成：排产工作台将出现 WO-003 返工插入事件。',
      },
    })

    const status = wrapper.get('[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('返工排产事件已生成')
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScheduleImpactPanel from '../../src/components/schedule/ScheduleImpactPanel.vue'

describe('ScheduleImpactPanel', () => {
  it('shows the baseline and agent comparison before a scheduler adopts the plan', () => {
    const wrapper = mount(ScheduleImpactPanel, {
      props: {
        comparison: {
          baseline: {
            otd: 72,
            delayedOrders: 5,
          },
          agent: {
            otd: 91,
            delayedOrders: 1,
          },
          otdImprovement: 19,
          delayedOrdersReduced: 4,
          changeoverDeltaMinutes: 18,
          utilizationDelta: 7,
          reasons: ['保护急单承诺交期', '合并 CNC 瓶颈批次', '保留首件质检窗口'],
        },
      },
    })

    const panel = wrapper.get('.impact-panel')
    expect(panel.attributes('aria-label')).toBe('排产影响分析')

    const summary = wrapper.get('.impact-summary')
    expect(summary.text()).toContain('基线 vs Agent 方案')
    expect(summary.text()).toContain('OTD +19%')

    const cards = wrapper.findAll('.comparison-card')
    expect(cards).toHaveLength(5)
    expect(cards[0].classes()).toContain('baseline')
    expect(cards[0].text()).toContain('人工基线')
    expect(cards[0].text()).toContain('72%')
    expect(cards[0].text()).toContain('延期 5 单')

    expect(cards[1].classes()).toContain('agent')
    expect(cards[1].text()).toContain('Agent 推荐')
    expect(cards[1].text()).toContain('91%')
    expect(cards[1].text()).toContain('延期 1 单')

    expect(cards[2].text()).toContain('延期减少')
    expect(cards[2].text()).toContain('4')
    expect(cards[3].text()).toContain('换线变化')
    expect(cards[3].text()).toContain('18min')
    expect(cards[4].text()).toContain('利用率变化')
    expect(cards[4].text()).toContain('+7%')

    const reasons = wrapper.findAll('.reason-item')
    expect(reasons.map(reason => reason.text())).toEqual([
      '保护急单承诺交期',
      '合并 CNC 瓶颈批次',
      '保留首件质检窗口',
    ])
  })

  it('keeps neutral deltas visible when the agent plan is only a no-regression option', () => {
    const wrapper = mount(ScheduleImpactPanel, {
      props: {
        comparison: {
          baseline: {
            otd: 88,
            delayedOrders: 2,
          },
          agent: {
            otd: 88,
            delayedOrders: 2,
          },
          otdImprovement: 0,
          delayedOrdersReduced: 0,
          changeoverDeltaMinutes: 0,
          utilizationDelta: 0,
          reasons: ['锁定期内不扰动', '等待物料复核后再重排'],
        },
      },
    })

    const text = wrapper.text()
    expect(text).toContain('OTD +0%')
    expect(text).toContain('延期减少')
    expect(text).toContain('0')
    expect(text).toContain('0min')
    expect(text).toContain('+0%')
    expect(text).toContain('锁定期内不扰动')
    expect(text).toContain('等待物料复核后再重排')
  })
})

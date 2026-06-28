import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RushOrderImpactPanel from '../../src/components/schedule/RushOrderImpactPanel.vue'

describe('RushOrderImpactPanel', () => {
  it('renders rush order impact evidence before schedulers commit an insertion', () => {
    const wrapper = mount(RushOrderImpactPanel, {
      props: {
        impact: {
          orderNumber: 'WO-RUSH-9001',
          affectedOrders: ['WO-DEMO-1002', 'WO-DEMO-1005'],
          delayHours: 4,
          changeoverIncreaseMinutes: 35,
          materialShortage: 'M-AL-6061 缺 12 件',
          materialAction: '启用替代料 M-AL-6061B',
          bottleneckEquipment: 'CNC-001',
          recommendation: '建议夜班加班插入',
          options: [
            {
              name: '直接插入',
              result: '破坏锁定期',
              recommended: false,
            },
            {
              name: '夜班加班插入',
              result: '保护承诺交期',
              recommended: true,
            },
          ],
        },
      },
    })

    const panel = wrapper.get('.rush-impact-panel')
    expect(panel.attributes('aria-label')).toBe('插单影响分析')

    const text = wrapper.text()
    expect(text).toContain('WO-RUSH-9001 急单影响分析')
    expect(text).toContain('建议夜班加班插入')
    expect(text).toContain('2')
    expect(text).toContain('WO-DEMO-1002 / WO-DEMO-1005')
    expect(text).toContain('4h')
    expect(text).toContain('+35min')
    expect(text).toContain('CNC-001')
    expect(text).toContain('M-AL-6061 缺 12 件')
    expect(text).toContain('启用替代料 M-AL-6061B')

    const options = wrapper.findAll('.option-chip')
    expect(options).toHaveLength(2)
    expect(options[0].classes()).not.toContain('recommended')
    expect(options[1].classes()).toContain('recommended')
    expect(options[1].text()).toContain('夜班加班插入')
    expect(options[1].text()).toContain('保护承诺交期')
  })

  it('keeps the impact summary explicit when there are no affected downstream orders', () => {
    const wrapper = mount(RushOrderImpactPanel, {
      props: {
        impact: {
          orderNumber: 'WO-RUSH-9002',
          affectedOrders: [],
          delayHours: 0,
          changeoverIncreaseMinutes: 0,
          materialShortage: '无新增缺料',
          materialAction: '保持当前齐套策略',
          bottleneckEquipment: 'CNC-003',
          recommendation: '可直接放入空窗',
          options: [
            {
              name: '空窗插入',
              result: '无下游延期',
              recommended: true,
            },
          ],
        },
      },
    })

    const cards = wrapper.findAll('.impact-card')
    expect(cards[0].text()).toContain('受影响工单')
    expect(cards[0].text()).toContain('0')
    expect(cards[1].text()).toContain('0h')
    expect(cards[2].text()).toContain('+0min')
    expect(cards[3].text()).toContain('无新增缺料')
    expect(wrapper.get('.option-chip.recommended').text()).toContain('无下游延期')
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ShortageActionPanel from '../../src/components/purchase/ShortageActionPanel.vue'
import type { ShortageAction, ShortageTrace } from '../../src/components/purchase/ShortageActionPanel.vue'

const openShortage: ShortageAction = {
  materialCode: 'M-AL-6061',
  materialName: '铝合金 6061',
  shortageQuantity: 12,
  availableQuantity: 3,
  unit: '件',
  affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
  scheduleWindow: '8 小时内影响 CNC 后段',
  recommendation: '采购加急或替代料',
  supplierName: '华东铝材',
  alternateMaterialCode: 'M-AL-6061B',
  alternateMaterialName: '铝合金 6061B 替代批次',
  status: 'open',
}

const trace: ShortageTrace = {
  title: '已生成采购加急单',
  detail: 'PO-RUSH-20260615 已提交，预计夜班前到料。',
}

describe('ShortageActionPanel', () => {
  it('shows open shortage evidence and prevents receipt before an expedite order exists', async () => {
    const wrapper = mount(ShortageActionPanel, {
      props: {
        shortage: openShortage,
        trace: null,
        hasExpediteOrder: false,
      },
    })

    const panel = wrapper.get('.shortage-action-panel')
    expect(panel.attributes('aria-label')).toBe('缺料采购协同')
    expect(wrapper.get('.risk-badge').text()).toBe('待处置')
    expect(wrapper.text()).toContain('M-AL-6061 排产缺口处置')
    expect(wrapper.text()).toContain('WO-RUSH-9001 / WO-DEMO-1002')
    expect(wrapper.text()).toContain('12 件')
    expect(wrapper.text()).toContain('当前可用 3 件')
    expect(wrapper.text()).toContain('采购加急或替代料')
    expect(wrapper.text()).toContain('M-AL-6061B')
    expect(wrapper.get('.shortage-trace.empty').text()).toContain('等待采购动作')

    const receive = wrapper.get('.btn.receive')
    expect(receive.attributes('disabled')).toBeDefined()
    await receive.trigger('click')

    expect(wrapper.emitted('receive')).toBeUndefined()
  })

  it('emits procurement actions and enables receipt once an expedite order exists', async () => {
    const wrapper = mount(ShortageActionPanel, {
      props: {
        shortage: {
          ...openShortage,
          status: 'ordered',
        },
        trace,
        hasExpediteOrder: true,
      },
    })

    expect(wrapper.get('.risk-badge').text()).toBe('已加急')
    expect(wrapper.get('.shortage-trace').classes()).not.toContain('empty')
    expect(wrapper.get('.shortage-trace').text()).toContain('PO-RUSH-20260615 已提交')

    await wrapper.get('.btn.primary').trigger('click')
    await wrapper.get('.btn.secondary').trigger('click')
    await wrapper.get('.btn.receive').trigger('click')

    expect(wrapper.emitted('expedite')).toEqual([[]])
    expect(wrapper.emitted('alternate')).toEqual([[]])
    expect(wrapper.emitted('receive')).toEqual([[]])
  })

  it('marks mitigated shortage risk as reduced after receipt or alternate material closure', () => {
    const wrapper = mount(ShortageActionPanel, {
      props: {
        shortage: {
          ...openShortage,
          shortageQuantity: 0,
          availableQuantity: 15,
          status: 'mitigated',
          recommendation: '排产复核可释放冻结工序',
        },
        trace: {
          title: '缺料风险已关闭',
          detail: '加急到货完成，排产缺料风险从高风险降为可执行。',
        },
        hasExpediteOrder: true,
      },
    })

    expect(wrapper.get('.risk-badge').text()).toBe('风险下降')
    expect(wrapper.text()).toContain('0 件')
    expect(wrapper.text()).toContain('当前可用 15 件')
    expect(wrapper.text()).toContain('排产复核可释放冻结工序')
    expect(wrapper.text()).toContain('缺料风险已关闭')
  })
})

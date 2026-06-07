import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScheduleMetrics from '../../src/components/schedule/ScheduleMetrics.vue'

describe('ScheduleMetrics', () => {
  it('announces scheduling KPI changes and applies threshold colors', () => {
    const wrapper = mount(ScheduleMetrics, {
      props: {
        utilization: 82,
        onTimeDelivery: 68,
        changeoverMinutes: 35,
        groupCount: 4,
      },
    })

    const metrics = wrapper.get('.metrics-bar')
    expect(metrics.attributes('role')).toBe('status')
    expect(metrics.attributes('aria-live')).toBe('polite')
    expect(metrics.attributes('aria-label')).toBe('排产指标')

    const values = wrapper.findAll('.metric-value')
    expect(values[0].text()).toBe('82%')
    expect(values[0].attributes('style')).toContain('color: rgb(82, 196, 26)')
    expect(values[1].text()).toBe('68%')
    expect(values[1].attributes('style')).toContain('color: rgb(255, 77, 79)')
    expect(values[2].text()).toBe('35min')
    expect(values[3].text()).toBe('4')
  })
})

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

  it('uses warning colors at middle KPI thresholds and critical colors below them', async () => {
    const wrapper = mount(ScheduleMetrics, {
      props: {
        utilization: 60,
        onTimeDelivery: 70,
        changeoverMinutes: 48,
        groupCount: 6,
      },
    })

    let values = wrapper.findAll('.metric-value')
    expect(values[0].attributes('style')).toContain('color: rgb(250, 173, 20)')
    expect(values[1].attributes('style')).toContain('color: rgb(250, 173, 20)')

    await wrapper.setProps({
      utilization: 59,
      onTimeDelivery: 69,
      changeoverMinutes: 52,
      groupCount: 7,
    })

    values = wrapper.findAll('.metric-value')
    expect(values[0].text()).toBe('59%')
    expect(values[0].attributes('style')).toContain('color: rgb(255, 77, 79)')
    expect(values[1].text()).toBe('69%')
    expect(values[1].attributes('style')).toContain('color: rgb(255, 77, 79)')
    expect(values[2].text()).toBe('52min')
    expect(values[3].text()).toBe('7')
  })

  it('keeps excellent utilization and on-time delivery green at the exact top thresholds', () => {
    const wrapper = mount(ScheduleMetrics, {
      props: {
        utilization: 80,
        onTimeDelivery: 90,
        changeoverMinutes: 12,
        groupCount: 2,
      },
    })

    const values = wrapper.findAll('.metric-value')
    expect(values[0].attributes('style')).toContain('color: rgb(82, 196, 26)')
    expect(values[1].attributes('style')).toContain('color: rgb(82, 196, 26)')
  })
})

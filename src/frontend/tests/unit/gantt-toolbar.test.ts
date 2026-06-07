import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GanttToolbar from '../../src/components/gantt/GanttToolbar.vue'

function mountToolbar(props = {}) {
  return mount(GanttToolbar, {
    props: {
      scale: 'day',
      objective: 'due_date',
      planName: 'AI 排产基线',
      lockPeriodHours: 8,
      loading: false,
      ...props,
    },
  })
}

describe('GanttToolbar', () => {
  it('uses explicit non-submit action buttons and emits scheduler commands', async () => {
    const wrapper = mountToolbar()

    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('type')).toBe('button')
    }

    await wrapper.get('.btn-primary').trigger('click')
    await wrapper.get('.btn-secondary').trigger('click')
    await wrapper.get('.btn-feedback').trigger('click')
    await wrapper.get('.btn-compare').trigger('click')
    await wrapper.get('.btn-export').trigger('click')
    await wrapper.find('.objective-label select').setValue('balanced')
    await wrapper.find('.scale-label select').setValue('week')

    expect(wrapper.emitted('optimize')).toHaveLength(1)
    expect(wrapper.emitted('refresh')).toHaveLength(1)
    expect(wrapper.emitted('feedback')).toHaveLength(1)
    expect(wrapper.emitted('compare')).toHaveLength(1)
    expect(wrapper.emitted('export-csv')).toHaveLength(1)
    expect(wrapper.emitted('update:objective')?.[0]).toEqual(['balanced'])
    expect(wrapper.emitted('update:scale')?.[0]).toEqual(['week'])
  })
})

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FeedbackForm from '../../src/components/gantt/FeedbackForm.vue'

const submitAdoptionFeedback = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/scheduling', () => ({
  submitAdoptionFeedback,
}))

function mountFeedbackForm() {
  return mount(FeedbackForm, {
    props: {
      visible: true,
      schedulePlanId: 'plan-001',
      workshopId: 'workshop-001',
      optimizationObjective: 'onTimeDelivery',
      movedOrderIds: ['WO-001'],
      aiTraceId: 'TRACE-AI-001',
    },
    global: {
      stubs: {
        Teleport: true,
      },
    },
  })
}

describe('FeedbackForm', () => {
  it('announces adoption feedback submission failures as an alert', async () => {
    submitAdoptionFeedback.mockRejectedValueOnce(new Error('后端不可用'))
    const wrapper = mountFeedbackForm()

    await wrapper.get('.form-select').setValue('equipmentFailure')
    await wrapper.get('.form-textarea').setValue('CNC-001 夜班停机，调度员人工调整。')
    await wrapper.get('.btn-submit').trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.classes()).toContain('error-msg')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toBe('提交失败: 后端不可用')
  })
})

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    submitAdoptionFeedback.mockReset()
  })

  it('keeps submit disabled until the planner selects an adoption feedback category', async () => {
    const wrapper = mountFeedbackForm()

    const submit = wrapper.get('.btn-submit')
    expect(submit.attributes('disabled')).toBeDefined()

    await submit.trigger('click')

    expect(submitAdoptionFeedback).not.toHaveBeenCalled()
    expect(wrapper.emitted('submitted')).toBeUndefined()
  })

  it('submits adoption feedback with scheduling evidence and emits submitted after backend write succeeds', async () => {
    submitAdoptionFeedback.mockResolvedValueOnce(undefined)
    const wrapper = mountFeedbackForm()

    await wrapper.get('.form-select').setValue('urgentInsertion')
    await wrapper.get('.form-textarea').setValue('客户急单插入，调度员采纳 AI 调整方案。')
    await wrapper.get('.btn-submit').trigger('click')
    await flushPromises()

    expect(submitAdoptionFeedback).toHaveBeenCalledWith({
      schedulePlanId: 'plan-001',
      workshopId: 'workshop-001',
      optimizationObjective: 'onTimeDelivery',
      reasonCategory: 'urgentInsertion',
      reasonDetail: '客户急单插入，调度员采纳 AI 调整方案。',
      movedOrderIds: ['WO-001'],
      aiTraceId: 'TRACE-AI-001',
    })
    expect(wrapper.emitted('submitted')).toEqual([[]])
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('emits close when the planner cancels the feedback dialog', async () => {
    const wrapper = mountFeedbackForm()

    await wrapper.get('.btn-cancel').trigger('click')

    expect(wrapper.emitted('close')).toEqual([[]])
    expect(submitAdoptionFeedback).not.toHaveBeenCalled()
  })

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

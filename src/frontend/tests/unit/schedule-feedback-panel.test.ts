import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScheduleFeedbackPanel from '../../src/components/schedule/ScheduleFeedbackPanel.vue'
import type { ScheduleFeedbackRecord } from '../../src/components/schedule/ScheduleFeedbackPanel.vue'

const latestFeedback: ScheduleFeedbackRecord = {
  decision: 'accepted',
  decisionLabel: '已采纳 Agent 推荐',
  reasonCategory: 'rush_order',
  categoryLabel: '急单插入',
  reasonDetail: '保护 WO-RUSH-9001 客户承诺交期，接受夜班加班。',
  objectiveLabel: 'OTD 交付承诺',
  createdAt: '2026-06-15 02:20',
}

describe('ScheduleFeedbackPanel', () => {
  it('emits an accepted decision with the selected reason category and trimmed detail', async () => {
    const wrapper = mount(ScheduleFeedbackPanel, {
      props: {
        latestFeedback: null,
        submitting: false,
        syncNote: '',
      },
    })

    const panel = wrapper.get('.feedback-panel')
    expect(panel.attributes('aria-label')).toBe('排产方案反馈')

    await wrapper.get('select').setValue('rush_order')
    await wrapper.get('input').setValue('  客户急单插入，调度员采纳 AI 加班方案。  ')
    await wrapper.get('.btn.accept').trigger('click')

    expect(wrapper.emitted('decision')).toEqual([
      [{
        decision: 'accepted',
        reasonCategory: 'rush_order',
        categoryLabel: '急单插入',
        reasonDetail: '客户急单插入，调度员采纳 AI 加班方案。',
      }],
    ])
  })

  it('emits a rejected decision and falls back to the default category when unchanged', async () => {
    const wrapper = mount(ScheduleFeedbackPanel, {
      props: {
        latestFeedback: null,
        submitting: false,
        syncNote: '',
      },
    })

    await wrapper.get('input').setValue('保持人工锁定窗口，稍后复核瓶颈设备。')
    await wrapper.get('.btn.reject').trigger('click')

    expect(wrapper.emitted('decision')).toEqual([
      [{
        decision: 'rejected',
        reasonCategory: 'due_date_protection',
        categoryLabel: '保护交期',
        reasonDetail: '保持人工锁定窗口，稍后复核瓶颈设备。',
      }],
    ])
  })

  it('shows the latest auditable feedback and announces backend sync notes', () => {
    const wrapper = mount(ScheduleFeedbackPanel, {
      props: {
        latestFeedback,
        submitting: false,
        syncNote: '排产采纳反馈已同步后台，可用于后续审计与模型复盘。',
      },
    })

    const record = wrapper.get('.feedback-record')
    expect(record.classes()).not.toContain('empty')
    expect(record.text()).toContain('已采纳 Agent 推荐')
    expect(record.text()).toContain('急单插入 · OTD 交付承诺')
    expect(record.text()).toContain('保护 WO-RUSH-9001 客户承诺交期')
    expect(record.text()).toContain('2026-06-15 02:20')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('排产采纳反馈已同步后台')
  })

  it('keeps pending and submitting states explicit before feedback is written', () => {
    const wrapper = mount(ScheduleFeedbackPanel, {
      props: {
        latestFeedback: null,
        submitting: true,
        syncNote: '',
      },
    })

    const record = wrapper.get('.feedback-record.empty')
    expect(record.text()).toContain('等待调度员决策')
    expect(record.text()).toContain('当前 Agent 推荐尚未进入反馈数据集')
    expect(wrapper.get('.btn.reject').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.btn.accept').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.sync-note').exists()).toBe(false)
  })

  it('uses an explicit fallback when the latest feedback has no supplemental detail', () => {
    const wrapper = mount(ScheduleFeedbackPanel, {
      props: {
        latestFeedback: {
          ...latestFeedback,
          reasonDetail: '',
        },
        submitting: false,
        syncNote: '',
      },
    })

    expect(wrapper.get('.feedback-record').text()).toContain('未填写补充说明')
  })
})

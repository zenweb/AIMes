import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import QualityMrbDispositionPanel from '../../src/components/quality/QualityMrbDispositionPanel.vue'
import { buildQualityMrbDispositionRecord, type QualityMrbDispositionRecord } from '../../src/utils/quality-mrb-disposition-sync'

function record(overrides: Partial<QualityMrbDispositionRecord> = {}): QualityMrbDispositionRecord {
  return {
    ...buildQualityMrbDispositionRecord('2026-05-31T08:00:00.000Z'),
    ...overrides,
  }
}

describe('QualityMrbDispositionPanel', () => {
  it('names the create action with the affected work order and inspection', () => {
    const preview = record()

    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview,
        record: null,
        syncMessage: '',
      },
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('生成 WO-004 INS-004 MRB 报废补料决策')
  })

  it('emits create when the reviewer generates a new MRB disposition', async () => {
    const preview = record()

    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview,
        record: null,
        syncMessage: '',
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('create')).toHaveLength(1)
  })

  it('names the close action with the affected work order', () => {
    const preview = record()

    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview,
        record: record({ status: 'active' }),
        syncMessage: '',
      },
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('确认 WO-004 MRB 处置闭环')
  })

  it('emits close while the MRB disposition is still active', async () => {
    const preview = record()

    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview,
        record: record({ status: 'active' }),
        syncMessage: '',
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('shows closure audit evidence without another action when MRB is closed', () => {
    const preview = record()

    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview,
        record: record({
          status: 'closed',
          closureAuditId: 'AUD-MRB-CLOSURE-20260615',
          closureTraceId: 'TRACE-MRB-CLOSURE-20260615',
        }),
        syncMessage: '',
      },
    })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.get('.button-row').text()).toContain('闭环追踪：AUD-MRB-CLOSURE-20260615 / TRACE-MRB-CLOSURE-20260615')
    expect(wrapper.get('.status-badge').classes()).toContain('closed')
  })

  it('announces MRB sync evidence as a polite status update', () => {
    const wrapper = mount(QualityMrbDispositionPanel, {
      props: {
        preview: record(),
        record: null,
        syncMessage: 'MRB 报废补料决策已生成：排产工作台将出现 WO-004 报废补料重排事件。',
      },
    })

    const status = wrapper.get('[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toContain('MRB 报废补料决策已生成')
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScheduleEventQueuePanel from '../../src/components/schedule/ScheduleEventQueuePanel.vue'
import type {
  ScheduleAgentSuggestion,
  ScheduleEventItem,
} from '../../src/components/schedule/ScheduleEventQueuePanel.vue'

const materialEvent: ScheduleEventItem = {
  id: 'evt-material-1',
  type: 'material',
  typeLabel: '缺料事件',
  severity: 'critical',
  severityLabel: '高风险',
  title: 'M-AL-6061 齐套缺口',
  impact: '急单与标准件共用关键物料，当前缺 12 件。',
  affectedOrders: '影响 2 单',
  window: '8 小时内',
  evidence: ['TRACE-MAT-001'],
}

const activeSuggestion: ScheduleAgentSuggestion = {
  eventId: 'evt-material-1',
  title: '缺料约束重排建议',
  action: '冻结受缺料影响工序，优先评估替代料并保留首件检验。',
  otdImpact: '+8%',
  delayImpact: '-1 单',
  changeoverImpact: '+12min',
  recommendedScenarioName: '冻结后段 + 替代料',
  decisionRationale: '保护急单交期，同时避免未确认替代料直接进入生产。',
  scenarioOptions: [
    {
      id: 'scenario-1',
      name: '冻结后段 + 替代料',
      strategy: '冻结 CNC 后段，等待替代料确认。',
      otdImpact: '+8%',
      delayImpact: '-1 单',
      changeoverImpact: '+12min',
      rationale: '扰动可控。',
      recommended: true,
    },
  ],
}

describe('ScheduleEventQueuePanel', () => {
  it('announces active agent suggestions and emits generate/adopt commands', async () => {
    const wrapper = mount(ScheduleEventQueuePanel, {
      props: {
        events: [materialEvent],
        activeSuggestion,
      },
    })

    const suggestion = wrapper.get('.agent-suggestion')
    expect(suggestion.attributes('role')).toBe('status')
    expect(suggestion.attributes('aria-live')).toBe('polite')
    expect(suggestion.attributes('aria-label')).toBe('当前 Agent 建议')
    expect(wrapper.text()).toContain('冻结后段 + 替代料')
    expect(wrapper.text()).toContain('TRACE-MAT-001')

    const eventList = wrapper.get('.event-grid')
    expect(eventList.attributes('role')).toBe('list')
    expect(eventList.attributes('aria-label')).toBe('排产事件重排队列：1 个待评估事件')
    const eventCard = wrapper.get('.event-card')
    expect(eventCard.attributes('role')).toBe('listitem')
    expect(eventCard.attributes('aria-label')).toBe('缺料事件：M-AL-6061 齐套缺口，高风险，影响 2 单，8 小时内')

    await wrapper.get('.event-card button').trigger('click')
    await wrapper.get('.adopt-suggestion').trigger('click')

    expect(wrapper.emitted('generate')?.[0]).toEqual([materialEvent])
    expect(wrapper.emitted('adopt')?.[0]).toEqual([activeSuggestion])
  })
})

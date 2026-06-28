import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleAgentWorkbenchPanel from '../../src/components/schedule/ScheduleAgentWorkbenchPanel.vue'
import type { AgentDecision } from '../../src/api/scheduling'
import type { ScheduleImpactComparison } from '../../src/components/schedule/ScheduleImpactPanel.vue'
import type { ScheduleFeedbackRecord } from '../../src/components/schedule/ScheduleFeedbackPanel.vue'

const getAgentDecisions = vi.hoisted(() => vi.fn())
const recommendAgentDecision = vi.hoisted(() => vi.fn())
const adoptAgentDecision = vi.hoisted(() => vi.fn())
const rejectAgentDecision = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/scheduling', () => ({
  adoptAgentDecision,
  getAgentDecisions,
  recommendAgentDecision,
  rejectAgentDecision,
}))

const comparison: ScheduleImpactComparison = {
  baseline: {
    otd: 82,
    delayedOrders: 5,
  },
  agent: {
    otd: 94,
    delayedOrders: 2,
  },
  otdImprovement: 12,
  delayedOrdersReduced: 3,
  changeoverDeltaMinutes: 18,
  utilizationDelta: 6,
  reasons: ['保护锁定期', '急单优先'],
}

function makeDecision(overrides: Partial<AgentDecision> = {}): AgentDecision {
  return {
    id: 'decision-1',
    triggerEventId: 'event-1',
    boundedContext: 'Scheduling',
    decisionType: 'ScheduleRecommendation',
    status: 'PendingReview',
    recommendedScenarioId: 'scenario-2',
    agentName: 'SchedulingAgent',
    agentVersion: '1.0.0',
    traceId: 'TRACE-SCHED-001',
    promptHash: 'prompt-hash',
    contextHash: 'context-hash',
    businessKey: 'ws-001',
    createdAt: '2026-06-02T01:00:00.000Z',
    scenarios: [
      {
        id: 'scenario-1',
        strategyName: '人工基线',
        otdProjection: 82,
        utilizationProjection: 76,
        changeoverProjection: 35,
      },
      {
        id: 'scenario-2',
        strategyName: '急单保护',
        otdProjection: 94,
        utilizationProjection: 88,
        changeoverProjection: 48,
        explanation: '保护急单并保持锁定期不变。',
      },
    ],
    ...overrides,
  }
}

function mountWorkbench(props: Partial<{
  latestFeedback: ScheduleFeedbackRecord | null
  formalScheduleWriteback: 'pending' | 'saved'
}> = {}) {
  return mount(ScheduleAgentWorkbenchPanel, {
    props: {
      activeSuggestion: null,
      comparison,
      latestFeedback: props.latestFeedback ?? null,
      formalScheduleWriteback: props.formalScheduleWriteback ?? 'pending',
    },
  })
}

describe('ScheduleAgentWorkbenchPanel', () => {
  beforeEach(() => {
    getAgentDecisions.mockReset()
    recommendAgentDecision.mockReset()
    adoptAgentDecision.mockReset()
    rejectAgentDecision.mockReset()
    getAgentDecisions.mockResolvedValue([])
    recommendAgentDecision.mockResolvedValue(makeDecision())
    adoptAgentDecision.mockResolvedValue(makeDecision({ status: 'Adopted', adoptedScenarioId: 'scenario-2' }))
    rejectAgentDecision.mockResolvedValue(makeDecision({ status: 'Rejected' }))
  })

  it('announces backend recommendation results as a status update', async () => {
    const wrapper = mountWorkbench()
    await flushPromises()

    await wrapper.get('.agent-actions button').trigger('click')
    await flushPromises()

    const note = wrapper.get('.agent-action-note')
    expect(note.text()).toContain('后端已生成 2 个方案')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
  })

  it('loads a pending backend decision and adopts the recommended scenario with an auditable reason', async () => {
    getAgentDecisions.mockResolvedValueOnce([makeDecision()])
    const wrapper = mountWorkbench()
    await flushPromises()

    expect(wrapper.get('.plan-compare').text()).toContain('后端决策 / PendingReview')
    expect(wrapper.get('.plan-compare').text()).toContain('急单保护')
    expect(wrapper.get('.explanation').text()).toContain('后端推荐采用 急单保护')
    expect(wrapper.get('.explanation').text()).toContain('traceId TRACE-SCHED-001')

    const buttons = wrapper.findAll('.agent-actions button')
    expect(buttons[1].attributes('disabled')).toBeUndefined()
    await buttons[1].trigger('click')
    await flushPromises()

    expect(adoptAgentDecision).toHaveBeenCalledWith(
      'decision-1',
      'scenario-2',
      '调度员工作台采纳 急单保护。',
    )
    const note = wrapper.get('.agent-action-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.text()).toContain('推荐方案已采纳')
    expect(wrapper.get('.plan-compare').text()).toContain('后端决策 / Adopted')
  })

  it('loads a pending backend decision and rejects it with a protected manual-lock reason', async () => {
    getAgentDecisions.mockResolvedValueOnce([makeDecision()])
    const wrapper = mountWorkbench()
    await flushPromises()

    const buttons = wrapper.findAll('.agent-actions button')
    expect(buttons[2].attributes('disabled')).toBeUndefined()
    await buttons[2].trigger('click')
    await flushPromises()

    expect(rejectAgentDecision).toHaveBeenCalledWith(
      'decision-1',
      '调度员工作台拒绝：保留人工锁定窗口，稍后重新评估。',
    )
    const note = wrapper.get('.agent-action-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.text()).toContain('推荐方案已拒绝')
    expect(wrapper.get('.plan-compare').text()).toContain('后端决策 / Rejected')
  })

  it('announces backend recommendation failures as an assertive alert', async () => {
    recommendAgentDecision.mockRejectedValueOnce(new Error('agent recommendation unavailable'))
    const wrapper = mountWorkbench()
    await flushPromises()

    await wrapper.get('.agent-actions button').trigger('click')
    await flushPromises()

    const note = wrapper.get('.agent-action-note.error')
    expect(note.text()).toContain('后端建议生成失败')
    expect(note.attributes('role')).toBe('alert')
    expect(note.attributes('aria-live')).toBe('assertive')
  })

  it('keeps event adoption feedback separate from formal schedule execution', async () => {
    const wrapper = mountWorkbench({
      latestFeedback: {
        decision: 'accepted',
        decisionLabel: '已采纳 Agent 推荐',
        reasonCategory: 'rush_event_agent',
        categoryLabel: '急单插单事件',
        reasonDetail: '急单插入重排建议：推荐方案：加班插入。',
        objectiveLabel: '交期优先',
        createdAt: '2026/6/11 23:50:00',
      },
    })
    await flushPromises()

    const executionTrace = wrapper.get('.execution-trace')
    expect(executionTrace.text()).toContain('排产反馈已写入本地复盘记录')
    expect(executionTrace.text()).toContain('正式计划待优化或保存')
    expect(executionTrace.text()).not.toContain('后端已写入正式排产计划')
    const writebackStep = executionTrace.findAll('li').find(step => step.text().includes('执行回写'))
    expect(writebackStep?.classes()).toContain('current')
  })

  it('marks formal schedule execution done after the plan is saved', async () => {
    const wrapper = mountWorkbench({
      formalScheduleWriteback: 'saved',
      latestFeedback: {
        decision: 'accepted',
        decisionLabel: '已采纳 Agent 推荐',
        reasonCategory: 'rush_event_agent',
        categoryLabel: '急单插单事件',
        reasonDetail: '急单插入重排建议：推荐方案：加班插入。',
        objectiveLabel: '交期优先',
        createdAt: '2026/6/11 23:58:00',
      },
    })
    await flushPromises()

    const executionTrace = wrapper.get('.execution-trace')
    expect(executionTrace.text()).toContain('正式排产计划已更新')
    expect(executionTrace.text()).not.toContain('正式计划待优化或保存')
    const writebackStep = executionTrace.findAll('li').find(step => step.text().includes('执行回写'))
    expect(writebackStep?.classes()).toContain('done')
  })
})

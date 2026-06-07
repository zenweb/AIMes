import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScheduleAgentWorkbenchPanel from '../../src/components/schedule/ScheduleAgentWorkbenchPanel.vue'
import type { AgentDecision } from '../../src/api/scheduling'
import type { ScheduleImpactComparison } from '../../src/components/schedule/ScheduleImpactPanel.vue'

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

function mountWorkbench() {
  return mount(ScheduleAgentWorkbenchPanel, {
    props: {
      activeSuggestion: null,
      comparison,
      latestFeedback: null,
    },
  })
}

describe('ScheduleAgentWorkbenchPanel', () => {
  beforeEach(() => {
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
})

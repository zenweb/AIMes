import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readScheduleFeedbackSnapshot,
  writeScheduleFeedbackSnapshot,
} from '../../src/utils/schedule-feedback-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

describe('schedule feedback sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
  })

  it('persists operator feedback and mirrors it into the OTD evidence chain', () => {
    const record = writeScheduleFeedbackSnapshot({
      decision: 'accepted',
      decisionLabel: '采纳 AI 排产建议',
      reasonCategory: 'capacity',
      categoryLabel: '产能匹配',
      reasonDetail: '瓶颈设备窗口满足交付承诺',
      objectiveLabel: 'OTD 交付承诺',
      createdAt: '2026-05-31T08:00:00.000Z',
      traceId: 'TRACE-SCH-FEEDBACK-UNIT',
      source: 'backend',
      agentDecisionId: 'DEC-001',
    })

    expect(record).toMatchObject({
      traceId: 'TRACE-SCH-FEEDBACK-UNIT',
      source: 'local',
      decision: 'accepted',
    })
    expect(readScheduleFeedbackSnapshot()).toMatchObject({
      decisionLabel: '采纳 AI 排产建议',
      reasonDetail: '瓶颈设备窗口满足交付承诺',
      source: 'local',
    })
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'schedule-feedback',
        stage: '人工采纳',
        title: '采纳 AI 排产建议',
        status: 'ready',
        statusLabel: '已采纳',
        traceId: 'TRACE-SCH-FEEDBACK-UNIT',
      }),
    ])
  })

  it('removes corrupt snapshot JSON so stale demo evidence cannot be reused', () => {
    localStorage.setItem('aimes_schedule_feedback_snapshot', '{bad json')

    expect(readScheduleFeedbackSnapshot()).toBeNull()
    expect(localStorage.getItem('aimes_schedule_feedback_snapshot')).toBeNull()
  })

  it('ignores incomplete snapshots that cannot explain the decision reason', () => {
    localStorage.setItem('aimes_schedule_feedback_snapshot', JSON.stringify({
      decision: 'accepted',
      decisionLabel: '采纳 AI 排产建议',
    }))

    expect(readScheduleFeedbackSnapshot()).toBeNull()
  })

  it('removes snapshots with blank reason details so OTD evidence does not reuse unauditable feedback', () => {
    localStorage.setItem('aimes_schedule_feedback_snapshot', JSON.stringify({
      decision: 'accepted',
      decisionLabel: '采纳 AI 排产建议',
      reasonCategory: 'capacity',
      categoryLabel: '产能匹配',
      reasonDetail: '   ',
      objectiveLabel: 'OTD 交付承诺',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))

    expect(readScheduleFeedbackSnapshot()).toBeNull()
    expect(localStorage.getItem('aimes_schedule_feedback_snapshot')).toBeNull()
  })
})

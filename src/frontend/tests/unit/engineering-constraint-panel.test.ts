import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EngineeringConstraintPanel from '../../src/components/schedule/EngineeringConstraintPanel.vue'
import type {
  EngineeringConstraintItem,
  EngineeringConstraintTrace,
} from '../../src/components/schedule/EngineeringConstraintPanel.vue'

const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

const constraints: EngineeringConstraintItem[] = [
  {
    id: 'bom-a100',
    kind: 'bom',
    kindLabel: 'BOM',
    sourceCode: 'BOM-A100',
    title: '替代料需要工程确认',
    explanation: 'M-AL-6061B 替代批次必须保留首件检验窗口。',
    evidence: ['ECN-2026-0601'],
    affectedOrders: '影响 WO-RUSH-9001',
    agentUsage: '约束急单插入窗口',
  },
]

const trace: EngineeringConstraintTrace = {
  summary: 'BOM-A100 / R-B200 已进入排产解释',
  detail: '排产 Agent 必须同时引用 BOM、工艺路线和技能资质约束。',
}

function mountPanel() {
  return mount(EngineeringConstraintPanel, {
    props: {
      constraints,
      trace,
    },
  })
}

describe('EngineeringConstraintPanel', () => {
  beforeEach(() => {
    upsertOtdEvidenceChainRecord.mockReset()
  })

  it('announces engineering evidence sync failures as an assertive alert', async () => {
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('OTD evidence storage unavailable')
    })
    const wrapper = mountPanel()

    await wrapper.get('.sync-button').trigger('click')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('alert')
    expect(note.attributes('aria-live')).toBe('assertive')
    expect(note.text()).toContain('工程约束证据同步失败')
    expect(note.text()).toContain('OTD evidence storage unavailable')
    expect(note.text()).not.toContain('工程约束证据已同步 OTD 复盘')
  })
})

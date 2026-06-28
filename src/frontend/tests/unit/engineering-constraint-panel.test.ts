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
  {
    id: 'route-b200',
    kind: 'route',
    kindLabel: '工艺路线',
    sourceCode: 'R-B200',
    title: '热处理必须排在精加工前',
    explanation: 'OP-090 热处理完成后才能进入 OP-120 精加工。',
    evidence: ['ROUTE-HT-2026-0601'],
    affectedOrders: '影响 WO-STD-2001',
    agentUsage: '约束工序依赖顺序',
  },
  {
    id: 'skill-c300',
    kind: 'labor',
    kindLabel: '技能资质',
    sourceCode: 'SKILL-C300',
    title: '夜班焊接需要持证人员',
    explanation: 'WELD-2 只能由有效焊接资质人员执行。',
    evidence: ['CERT-WELD-2026'],
    affectedOrders: '影响 WO-NIGHT-3001',
    agentUsage: '约束班组可执行性',
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

  it('syncs BOM, route, and labor constraints into OTD evidence with auditable statuses', async () => {
    const wrapper = mountPanel()

    await wrapper.get('.sync-button').trigger('click')

    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(3)
    expect(upsertOtdEvidenceChainRecord).toHaveBeenNthCalledWith(1, expect.objectContaining({
      id: 'engineering-constraint-bom-a100',
      stage: '工程约束',
      title: 'BOM：替代料需要工程确认',
      object: 'BOM-A100',
      source: 'AI 排产 / 工程数据约束',
      traceId: 'TRACE-ENG-BOM-A100',
      status: 'ready',
      statusLabel: '已引用',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenNthCalledWith(2, expect.objectContaining({
      id: 'engineering-constraint-route-b200',
      title: '工艺路线：热处理必须排在精加工前',
      object: 'R-B200',
      traceId: 'TRACE-ENG-ROUTE-B200',
      status: 'ready',
      statusLabel: '已约束排产',
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenNthCalledWith(3, expect.objectContaining({
      id: 'engineering-constraint-skill-c300',
      title: '技能资质：夜班焊接需要持证人员',
      object: 'SKILL-C300',
      traceId: 'TRACE-ENG-SKILL-C300',
      status: 'active',
      statusLabel: '待资质复核',
    }))

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(note.text()).toContain('工程约束证据已同步 OTD 复盘')
    expect(note.text()).toContain('3 条工程约束已写入统一证据链')
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

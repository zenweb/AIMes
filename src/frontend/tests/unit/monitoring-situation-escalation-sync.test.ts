import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  closeMonitoringSituationEscalation,
  readMonitoringSituationEscalations,
  readMonitoringSituationEscalationsBackendFirst,
  writeMonitoringSituationEscalation,
  type WriteMonitoringSituationEscalationInput,
} from '../../src/utils/monitoring-situation-escalation-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function escalationInput(overrides: Partial<WriteMonitoringSituationEscalationInput> = {}): WriteMonitoringSituationEscalationInput {
  return {
    sourceEventId: 'sf-001',
    source: '实时监控',
    eventTitle: 'CNC-001 瓶颈负载叠加缺料风险',
    eventImpact: '预计影响 WO-2026-0042 和 WO-RUSH-9001',
    workOrders: 'WO-2026-0042 / WO-RUSH-9001',
    owner: '调度主管',
    action: '锁定 CNC 分流窗口',
    relatedEvents: [
      {
        source: '缺料风险',
        title: 'AL-6061 今日短缺',
        impact: '齐套率不足',
        owner: '采购主管',
      },
      {
        source: '质量返工',
        title: '首件返工窗口冲突',
        impact: '返工占用夜班',
        owner: '质量主管',
      },
    ],
    ...overrides,
  }
}

describe('monitoring situation escalation sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('writes an escalation package, mirrors active OTD evidence, and syncs backend best-effort', async () => {
    const record = writeMonitoringSituationEscalation(escalationInput())
    await vi.dynamicImportSettled()

    expect(readMonitoringSituationEscalations()).toEqual([record])
    expect(record).toEqual(expect.objectContaining({
      id: 'monitoring-situation-sf-001',
      priority: 'critical',
      status: 'escalated',
      traceId: 'TRACE-SF-ESC-SF-001',
      evidence: expect.arrayContaining([
        'TRACE-SF-SF-001',
        '缺料风险 / 采购主管',
        '质量返工 / 质量主管',
      ]),
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/monitoring-situation-escalations', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'monitoring-situation-sf-001',
        stage: '现场处置包',
        object: 'WO-2026-0042 / WO-RUSH-9001',
        traceId: 'TRACE-SF-ESC-SF-001',
        status: 'active',
        statusLabel: '待跨模块处置',
      }),
    ])
  })

  it('closes an escalation package and mirrors closed OTD evidence', async () => {
    const record = writeMonitoringSituationEscalation(escalationInput())

    const closed = closeMonitoringSituationEscalation(record.id, 'TRACE-RISK-CLOSED-001', '生产经理')
    await vi.dynamicImportSettled()

    expect(closed).toEqual(expect.objectContaining({
      id: record.id,
      status: 'closed',
      statusLabel: '已闭环',
      priority: 'warning',
      closureTrace: 'TRACE-RISK-CLOSED-001',
    }))
    expect(readMonitoringSituationEscalations()[0]).toEqual(closed)
    expect(readOtdEvidenceChainRecords()[0]).toEqual(expect.objectContaining({
      id: record.id,
      status: 'closed',
      statusLabel: '已闭环',
      traceId: 'TRACE-SF-ESC-SF-001',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/monitoring-situation-escalations', closed)
  })

  it('falls back to local escalation packages when backend returns no records', async () => {
    const localRecord = writeMonitoringSituationEscalation(escalationInput())
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readMonitoringSituationEscalationsBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/monitoring-situation-escalations', { params: { take: 8 } })
  })

  it('throws monitoring escalation backend failures when fail-loud evidence is required', async () => {
    const localRecord = writeMonitoringSituationEscalation(escalationInput())
    httpGet.mockRejectedValueOnce(new Error('monitoring escalation backend unavailable'))

    await expect(readMonitoringSituationEscalationsBackendFirst({ failLoud: true })).rejects.toThrow('monitoring escalation backend unavailable')
    expect(readMonitoringSituationEscalations()).toEqual([localRecord])
  })

  it('deduplicates the same escalation id and caps local packages at 8', () => {
    writeMonitoringSituationEscalation(escalationInput({ sourceEventId: 'sf-001', eventTitle: '旧态势' }))
    writeMonitoringSituationEscalation(escalationInput({ sourceEventId: 'sf-001', eventTitle: '新态势' }))
    for (let index = 2; index < 9; index += 1) {
      writeMonitoringSituationEscalation(escalationInput({ sourceEventId: `sf-00${index}` }))
    }

    const records = readMonitoringSituationEscalations()
    expect(records).toHaveLength(8)
    expect(records.some(record => record.summary.includes('旧态势'))).toBe(false)
    expect(records.some(record => record.summary.includes('新态势'))).toBe(true)
  })

  it('removes corrupt escalation JSON so monitoring boards do not render stale packages', () => {
    localStorage.setItem('aimes_monitoring_situation_escalations', '{bad json')

    expect(readMonitoringSituationEscalations()).toEqual([])
    expect(localStorage.getItem('aimes_monitoring_situation_escalations')).toBeNull()
  })

  it('removes incomplete escalation packages that cannot explain owner action or OTD impact', () => {
    localStorage.setItem('aimes_monitoring_situation_escalations', JSON.stringify([
      {
        id: 'monitoring-situation-sf-001',
        sourceEventId: 'sf-001',
        title: '实时监控 现场态势升级处置包',
        traceId: 'TRACE-SF-ESC-SF-001',
        workOrders: 'WO-2026-0042',
        evidence: [],
        dispatchSteps: [],
      },
    ]))

    expect(readMonitoringSituationEscalations()).toEqual([])
    expect(localStorage.getItem('aimes_monitoring_situation_escalations')).toBeNull()
  })
})

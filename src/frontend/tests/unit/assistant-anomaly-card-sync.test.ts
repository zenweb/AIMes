import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readAssistantAnomalyDispositionPackages,
  readAssistantAnomalyDispositionPackagesBackendFirst,
  writeAssistantAnomalyDispositionPackage,
} from '../../src/utils/assistant-anomaly-card-sync'
import { readAnomalyDispatchRecords } from '../../src/utils/anomaly-dispatch-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'
import { readProductionAnomalyEvent } from '../../src/utils/production-anomaly-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('assistant anomaly card sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores anomaly packages, mirrors production/risk/OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writeAssistantAnomalyDispositionPackage({
      actor: 'admin',
      role: 'Planner',
    })
    await vi.dynamicImportSettled()

    expect(readAssistantAnomalyDispositionPackages()).toEqual([record])
    expect(record).toEqual(expect.objectContaining({
      id: 'assistant-anomaly-cnc001-temperature',
      actor: 'admin',
      role: 'Planner',
      priority: 'critical',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/assistant-anomaly-packages', record)
    expect(readProductionAnomalyEvent()).toEqual(expect.objectContaining({
      id: 'prod-anomaly-chat-cnc001-temp',
      detectedBy: 'admin',
      detectedAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(readAnomalyDispatchRecords()).toEqual([
      expect.objectContaining({
        id: 'anomaly-dispatch-chat-cnc001-temp',
        owner: '设备主管 赵工',
        traceId: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
      }),
    ])
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'production-anomaly-assistant-anomaly-cnc001-temperature',
        stage: '生产异常',
        status: 'active',
        statusLabel: '助手创建待复核',
      }),
      expect.objectContaining({
        id: 'assistant-anomaly-assistant-anomaly-cnc001-temperature',
        stage: '助手异常处置',
        status: 'active',
        statusLabel: '助手已创建待分流',
      }),
    ]))
  })

  it('falls back to local anomaly packages when backend returns no records', async () => {
    const localRecord = writeAssistantAnomalyDispositionPackage({ actor: 'admin', role: 'Planner' })
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readAssistantAnomalyDispositionPackagesBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/assistant-anomaly-packages', { params: { take: 8 } })
  })

  it('fails loud for anomaly package refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant anomaly backend unavailable'))

    await expect(readAssistantAnomalyDispositionPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('assistant anomaly backend unavailable')
  })

  it('fails loud when anomaly package backend returns a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readAssistantAnomalyDispositionPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回非数组异常处置包审计载荷')
  })

  it('keeps local complete anomaly package when backend returns incomplete package evidence', async () => {
    const localRecord = writeAssistantAnomalyDispositionPackage({ actor: 'admin', role: 'Planner' })
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: localRecord.id,
          title: localRecord.title,
          traceId: 'TRACE-BACKEND-PARTIAL-ANOMALY',
          createdAt: '2026-06-20T10:00:00.000Z',
        },
      ],
    })

    await expect(readAssistantAnomalyDispositionPackagesBackendFirst()).resolves.toEqual([localRecord])
  })

  it('caps local anomaly packages at 8 records', () => {
    for (let index = 0; index < 9; index += 1) {
      writeAssistantAnomalyDispositionPackage({ actor: `actor-${index}`, role: 'Planner' })
      const records = readAssistantAnomalyDispositionPackages()
      localStorage.setItem('aimes_assistant_anomaly_packages', JSON.stringify([
        {
          ...records[0],
          id: `assistant-anomaly-${index}`,
          auditCode: `AUD-ANOMALY-${index}`,
          traceId: `TRACE-ANOMALY-${index}`,
        },
        ...records.slice(1),
      ]))
    }

    const records = readAssistantAnomalyDispositionPackages()
    expect(records).toHaveLength(8)
    expect(records[0]?.id).toBe('assistant-anomaly-8')
    expect(records.at(-1)?.id).toBe('assistant-anomaly-1')
  })

  it('removes corrupt anomaly package JSON so boards do not render stale assistant actions', () => {
    localStorage.setItem('aimes_assistant_anomaly_packages', '{bad json')

    expect(readAssistantAnomalyDispositionPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_anomaly_packages')).toBeNull()
  })

  it('removes incomplete anomaly packages that cannot explain dispatch ownership or delivery impact', () => {
    localStorage.setItem('aimes_assistant_anomaly_packages', JSON.stringify([
      {
        id: 'assistant-anomaly-cnc001-temperature',
        title: 'CNC-001 主轴温升异常处置卡',
        auditCode: 'AUD-CHAT-ANOMALY-20260522-001',
        traceId: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
        dispatchSteps: [],
      },
    ]))

    expect(readAssistantAnomalyDispositionPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_anomaly_packages')).toBeNull()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  closeAssistantRecoveryPackage,
  closeAssistantRecoveryPurchaseAction,
  closeAssistantRecoveryQualityAction,
  readAssistantRecoveryPackages,
  readAssistantRecoveryPackagesBackendFirst,
  writeAssistantRecoveryPackage,
} from '../../src/utils/assistant-action-package-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('assistant action package sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores recovery packages, mirrors active OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writeAssistantRecoveryPackage({
      actor: 'admin',
      role: 'Planner',
    })
    await vi.dynamicImportSettled()

    expect(readAssistantRecoveryPackages()).toEqual([record])
    expect(record).toEqual(expect.objectContaining({
      id: 'wo-rush-9001-delivery-recovery',
      actor: 'admin',
      role: 'Planner',
      priority: 'critical',
      status: 'active',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/assistant-recovery-packages', record)
    expect(readOtdEvidenceChainRecords()).toEqual([
      expect.objectContaining({
        id: 'assistant-recovery-wo-rush-9001-delivery-recovery',
        stage: '助手执行包',
        status: 'active',
        statusLabel: '待跨模块复核',
        traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
      }),
    ])
  })

  it('falls back to local recovery packages when backend returns no records', async () => {
    const localRecord = writeAssistantRecoveryPackage({ actor: 'admin', role: 'Planner' })
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readAssistantRecoveryPackagesBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/assistant-recovery-packages', { params: { take: 8 } })
  })

  it('fails loud for recovery package refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant recovery backend unavailable'))

    await expect(readAssistantRecoveryPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('assistant recovery backend unavailable')
  })

  it('fails loud when recovery package backend returns a non-array payload', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readAssistantRecoveryPackagesBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回非数组执行包审计载荷')
  })

  it('keeps local complete recovery package when backend returns incomplete package evidence', async () => {
    const localRecord = writeAssistantRecoveryPackage({ actor: 'admin', role: 'Planner' })
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: localRecord.id,
          title: localRecord.title,
          traceId: 'TRACE-BACKEND-PARTIAL-RECOVERY',
          createdAt: '2026-06-20T08:00:00.000Z',
        },
      ],
    })

    await expect(readAssistantRecoveryPackagesBackendFirst()).resolves.toEqual([localRecord])
  })

  it('closes purchase, quality, and package handoff actions with OTD evidence', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T09:00:00.000Z'))
    const record = writeAssistantRecoveryPackage({ actor: 'admin', role: 'Planner' })

    const purchaseClosed = closeAssistantRecoveryPurchaseAction(record.id, '采购 王工', 'PO-RUSH-20260531')
    const qualityClosed = closeAssistantRecoveryQualityAction(record.id, '质量 周工', 'FAI-20260531')
    const packageClosed = closeAssistantRecoveryPackage(record.id, '调度员 李工')

    expect(purchaseClosed).toEqual(expect.objectContaining({
      purchaseActionStatus: 'closed',
      purchaseOrderNumber: 'PO-RUSH-20260531',
      statusLabel: '采购动作已闭合',
    }))
    expect(qualityClosed).toEqual(expect.objectContaining({
      qualityActionStatus: 'closed',
      firstArticleRecord: 'FAI-20260531',
      statusLabel: '质量动作已闭合',
    }))
    expect(packageClosed).toEqual(expect.objectContaining({
      status: 'closed',
      statusLabel: '执行交接已闭环',
      closedBy: '调度员 李工',
    }))
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'assistant-recovery-purchase-wo-rush-9001-delivery-recovery',
        status: 'closed',
        statusLabel: '采购动作已闭合',
      }),
      expect.objectContaining({
        id: 'assistant-recovery-quality-wo-rush-9001-delivery-recovery',
        status: 'closed',
        statusLabel: '质量动作已闭合',
      }),
      expect.objectContaining({
        id: 'assistant-recovery-wo-rush-9001-delivery-recovery',
        status: 'closed',
        statusLabel: '执行交接已闭环',
      }),
    ]))
  })

  it('caps local recovery packages at 8 records', () => {
    for (let index = 0; index < 9; index += 1) {
      writeAssistantRecoveryPackage({ actor: `actor-${index}`, role: 'Planner' })
      const records = readAssistantRecoveryPackages()
      localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([
        {
          ...records[0],
          id: `assistant-recovery-${index}`,
          auditCode: `AUD-RECOVERY-${index}`,
          traceId: `TRACE-RECOVERY-${index}`,
        },
        ...records.slice(1),
      ]))
    }

    const records = readAssistantRecoveryPackages()
    expect(records).toHaveLength(8)
    expect(records[0]?.id).toBe('assistant-recovery-8')
    expect(records.at(-1)?.id).toBe('assistant-recovery-1')
  })

  it('removes corrupt package JSON so recovery boards do not render stale handoff state', () => {
    localStorage.setItem('aimes_assistant_recovery_packages', '{bad json')

    expect(readAssistantRecoveryPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_recovery_packages')).toBeNull()
  })

  it('removes incomplete recovery packages that cannot explain ownership or dispatch actions', () => {
    localStorage.setItem('aimes_assistant_recovery_packages', JSON.stringify([
      {
        id: 'wo-rush-9001-delivery-recovery',
        title: 'WO-RUSH-9001 交期恢复执行包',
        auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-20260521-001',
        traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
        workOrders: 'WO-RUSH-9001',
        dispatchSteps: [],
      },
    ]))

    expect(readAssistantRecoveryPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_recovery_packages')).toBeNull()
  })
})

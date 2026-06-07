import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readAssistantEngineeringConstraintPackages,
  readAssistantEngineeringConstraintPackagesBackendFirst,
  writeAssistantEngineeringConstraintPackage,
} from '../../src/utils/assistant-engineering-constraint-package-sync'
import {
  readEngineeringChangeImpactAnalysis,
  readRouteCapabilityValidation,
} from '../../src/utils/engineering-change-sync'
import { readOtdEvidenceChainRecords } from '../../src/utils/otd-evidence-chain-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('assistant engineering constraint package sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores engineering constraint packages, seeds dependencies, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const record = writeAssistantEngineeringConstraintPackage({
      actor: 'admin',
      role: 'Planner',
    })
    await vi.dynamicImportSettled()

    expect(readAssistantEngineeringConstraintPackages()).toEqual([record])
    expect(record).toEqual(expect.objectContaining({
      id: 'assistant-engineering-constraint-a100-rb200',
      actor: 'admin',
      role: 'Planner',
      priority: 'warning',
      createdAt: '2026-05-31T08:00:00.000Z',
    }))
    expect(readEngineeringChangeImpactAnalysis()).toEqual(expect.objectContaining({
      changeId: 'ECN-BOM-A100-6061B-20260521',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1007',
    }))
    expect(readRouteCapabilityValidation()).toEqual(expect.objectContaining({
      routeCode: 'R-B200',
      decision: 'released',
    }))
    expect(httpPost).toHaveBeenCalledWith('/scheduling/assistant-engineering-constraint-packages', record)
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'assistant-engineering-constraint-assistant-engineering-constraint-a100-rb200',
        stage: '助手工程约束',
        status: 'active',
        statusLabel: '待工程约束复核',
        traceId: 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523',
      }),
    ]))
  })

  it('falls back to local engineering constraint packages when backend returns no records', async () => {
    const localRecord = writeAssistantEngineeringConstraintPackage({ actor: 'admin', role: 'Planner' })
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readAssistantEngineeringConstraintPackagesBackendFirst()).resolves.toEqual([localRecord])
    expect(httpGet).toHaveBeenCalledWith('/scheduling/assistant-engineering-constraint-packages', { params: { take: 8 } })
  })

  it('caps local engineering constraint packages at 8 records', () => {
    for (let index = 0; index < 9; index += 1) {
      writeAssistantEngineeringConstraintPackage({ actor: `actor-${index}`, role: 'Planner' })
      const records = readAssistantEngineeringConstraintPackages()
      localStorage.setItem('aimes_assistant_engineering_constraint_packages', JSON.stringify([
        {
          ...records[0],
          id: `assistant-engineering-${index}`,
          auditCode: `AUD-ENG-${index}`,
          traceId: `TRACE-ENG-${index}`,
        },
        ...records.slice(1),
      ]))
    }

    const records = readAssistantEngineeringConstraintPackages()
    expect(records).toHaveLength(8)
    expect(records[0]?.id).toBe('assistant-engineering-8')
    expect(records.at(-1)?.id).toBe('assistant-engineering-1')
  })

  it('removes corrupt engineering constraint JSON so boards do not render stale packages', () => {
    localStorage.setItem('aimes_assistant_engineering_constraint_packages', '{bad json')

    expect(readAssistantEngineeringConstraintPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_engineering_constraint_packages')).toBeNull()
  })

  it('removes incomplete engineering constraint packages that cannot explain BOM route or dispatch actions', () => {
    localStorage.setItem('aimes_assistant_engineering_constraint_packages', JSON.stringify([
      {
        id: 'assistant-engineering-constraint-a100-rb200',
        title: 'BOM-A100 / R-B200 工程约束复核包',
        auditCode: 'AUD-CHAT-ENG-CONSTRAINT-20260523-001',
        traceId: 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523',
        workOrders: 'WO-RUSH-9001',
        dispatchSteps: [],
      },
    ]))

    expect(readAssistantEngineeringConstraintPackages()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_engineering_constraint_packages')).toBeNull()
  })
})

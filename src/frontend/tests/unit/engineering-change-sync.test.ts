import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  approveEngineeringChangeImpactAnalysis,
  readAlternateMaterialApproval,
  readAlternateMaterialApprovalBackendFirst,
  readEngineeringChangeImpactAnalysis,
  readEngineeringChangeImpactAnalysisBackendFirst,
  readRouteCapabilityValidation,
  readRouteCapabilityValidationBackendFirst,
  writeAlternateMaterialApproval,
  writeEngineeringChangeImpactAnalysis,
  writeRouteCapabilityValidation,
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

describe('engineering change sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('stores engineering evidence, mirrors OTD evidence, and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    const alternate = writeAlternateMaterialApproval()
    const impact = writeEngineeringChangeImpactAnalysis()
    const approved = approveEngineeringChangeImpactAnalysis({
      decidedAt: '2026-05-31T09:00:00.000Z',
    })
    const route = writeRouteCapabilityValidation({ decision: 'released' })
    await vi.dynamicImportSettled()

    expect(readAlternateMaterialApproval()).toEqual(alternate)
    expect(readEngineeringChangeImpactAnalysis()).toEqual(approved)
    expect(readRouteCapabilityValidation()).toEqual(route)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/alternate-material-approval', alternate)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/engineering-change-impact', impact)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/engineering-change-impact', approved)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/route-capability-validation', route)
    expect(readOtdEvidenceChainRecords()).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'alt-mat-approval-bom-a100-al6061b', stage: '工程放行' }),
      expect.objectContaining({ id: 'engineering-change-impact-bom-a100-al6061b-approved', stage: '工程变更批准' }),
      expect.objectContaining({ id: 'route-capability-rb200-op090', stage: '工艺能力放行' }),
    ]))
  })

  it('falls back to local engineering evidence when backend returns no records', async () => {
    const alternate = writeAlternateMaterialApproval()
    const impact = writeEngineeringChangeImpactAnalysis()
    const route = writeRouteCapabilityValidation()
    httpGet.mockResolvedValue({ data: null })

    await expect(readAlternateMaterialApprovalBackendFirst()).resolves.toEqual(alternate)
    await expect(readEngineeringChangeImpactAnalysisBackendFirst()).resolves.toEqual(impact)
    await expect(readRouteCapabilityValidationBackendFirst()).resolves.toEqual(route)
  })

  it('throws route capability backend failures when fail-loud evidence is required', async () => {
    const route = writeRouteCapabilityValidation()
    const backendError = new Error('route capability backend unavailable')
    httpGet.mockRejectedValueOnce(backendError)

    await expect(readRouteCapabilityValidationBackendFirst({ failLoud: true })).rejects.toThrow('route capability backend unavailable')
    expect(readRouteCapabilityValidation()).toEqual(route)
  })

  it('removes incomplete alternate material approvals that cannot explain release responsibility', () => {
    localStorage.setItem('aimes_alternate_material_approval', JSON.stringify({
      status: 'approved',
      alternateMaterialCode: 'M-AL-6061B',
    }))

    expect(readAlternateMaterialApproval()).toBeNull()
    expect(localStorage.getItem('aimes_alternate_material_approval')).toBeNull()
  })

  it('removes incomplete engineering impact records that would otherwise be default-filled', () => {
    localStorage.setItem('aimes_engineering_change_impact_analysis', JSON.stringify({
      changeId: 'ECN-BOM-A100-6061B-20260521',
      traceId: 'TRACE-ENG-ECN-BOM-A100-6061B',
    }))

    expect(readEngineeringChangeImpactAnalysis()).toBeNull()
    expect(localStorage.getItem('aimes_engineering_change_impact_analysis')).toBeNull()
  })

  it('removes incomplete route capability validations that cannot explain capacity release', () => {
    localStorage.setItem('aimes_route_capability_validation', JSON.stringify({
      routeCode: 'R-B200',
      operationCode: 'OP-090',
      traceId: 'TRACE-ROUTE-CAP-R-B200-OP-090',
    }))

    expect(readRouteCapabilityValidation()).toBeNull()
    expect(localStorage.getItem('aimes_route_capability_validation')).toBeNull()
  })
})

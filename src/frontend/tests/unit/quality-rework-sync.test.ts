import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  buildQualityReworkImpact,
  readQualityReworkImpact,
  readQualityReworkImpactBackendFirst,
  selectQualityReworkInspection,
  writeQualityReworkImpact,
  type QualityReworkImpact,
} from '../../src/utils/quality-rework-sync'
import type { InspectionDto } from '../../src/types/quality'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn(() => Promise.resolve({ data: null })))

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function inspection(overrides: Partial<InspectionDto> = {}): InspectionDto {
  return {
    id: 'INS-003',
    workOrderId: 'WO-003',
    productCode: 'PRD-003',
    processName: '热处理',
    inspectionPoint: '硬度抽检',
    inspectionQuantity: 10,
    qualifiedQuantity: 8,
    defectQuantity: 2,
    result: 'rework',
    inspectorId: 'QI-001',
    inspectedAt: '2026-05-31T08:00:00.000Z',
    passRate: 80,
    ...overrides,
  }
}

function impact(overrides: Partial<QualityReworkImpact> = {}): QualityReworkImpact {
  return {
    inspectionId: 'INS-003',
    workOrderId: 'WO-003',
    productCode: 'PRD-003',
    processName: '热处理',
    equipmentCode: 'HT-01',
    materialBatchCode: 'MAT-AL6061-B03',
    batchCode: 'WO-003-硬度抽检',
    inspectionPoint: '硬度抽检',
    defectQuantity: 2,
    reworkHours: 6,
    otdImpact: 'WO-003 延期 +1 单风险',
    recommendedAction: '建议插入返工与复验窗口，锁定质检复验时间。',
    rootCause: '硬度不足 / 热处理参数漂移',
    evidence: ['硬度抽检 检验结果 rework', 'HT-01 关联工序 热处理'],
    createdAt: '2026-05-31T08:00:00.000Z',
    ...overrides,
  }
}

describe('quality rework sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockClear()
  })

  it('stores rework impact and syncs backend best-effort', async () => {
    const record = impact()

    writeQualityReworkImpact(record)
    await vi.dynamicImportSettled()

    expect(readQualityReworkImpact()).toEqual(record)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/quality-rework-impact', record)
  })

  it('falls back to local rework impact when backend returns no record', async () => {
    const localRecord = impact()
    writeQualityReworkImpact(localRecord)
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readQualityReworkImpactBackendFirst()).resolves.toEqual(localRecord)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/quality-rework-impact/latest', { suppressErrorToast: true })
  })

  it('falls back to local auditable rework impact when backend returns an incomplete latest record', async () => {
    const localRecord = impact()
    writeQualityReworkImpact(localRecord)
    httpGet.mockResolvedValueOnce({
      data: {
        inspectionId: 'INS-BACKEND-PARTIAL',
        createdAt: '2026-06-01T08:00:00.000Z',
      },
    })

    await expect(readQualityReworkImpactBackendFirst()).resolves.toEqual(localRecord)
  })

  it('fails loud for quality rework impact refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('quality rework backend unavailable'))

    await expect(readQualityReworkImpactBackendFirst({ failLoud: true }))
      .rejects.toThrow('quality rework backend unavailable')
  })

  it('keeps the newest auditable rework impact between backend and local records', async () => {
    const localRecord = impact({ createdAt: '2026-05-31T08:00:00.000Z' })
    const backendRecord = impact({
      inspectionId: 'INS-BACKEND-FRESH',
      createdAt: '2026-06-01T08:00:00.000Z',
    })
    writeQualityReworkImpact(localRecord)
    httpGet.mockResolvedValueOnce({ data: backendRecord })

    await expect(readQualityReworkImpactBackendFirst()).resolves.toEqual(backendRecord)

    const fresherLocalRecord = impact({
      inspectionId: 'INS-LOCAL-FRESH',
      createdAt: '2026-06-02T08:00:00.000Z',
    })
    writeQualityReworkImpact(fresherLocalRecord)
    httpGet.mockResolvedValueOnce({ data: backendRecord })

    await expect(readQualityReworkImpactBackendFirst()).resolves.toEqual(fresherLocalRecord)
  })

  it('builds rework impact from the selected rework inspection before fail inspections', () => {
    const fail = inspection({ id: 'INS-FAIL', result: 'fail', defectQuantity: 0 })
    const rework = inspection()

    expect(selectQualityReworkInspection([fail, rework])).toEqual(rework)
    expect(buildQualityReworkImpact(rework)).toEqual(expect.objectContaining({
      inspectionId: 'INS-003',
      equipmentCode: 'HT-01',
      materialBatchCode: 'MAT-AL6061-B03',
      defectQuantity: 2,
      reworkHours: 6,
    }))
  })

  it('builds hard-fail rework impact with frozen-process evidence when no rework inspection exists', () => {
    const fail = inspection({
      id: 'INS-FAIL',
      productCode: 'PRD-001',
      processName: '装配',
      inspectionPoint: '最终 功能 测试',
      result: 'fail',
      defectQuantity: 0,
    })

    expect(selectQualityReworkInspection([fail])).toEqual(fail)
    expect(buildQualityReworkImpact(fail)).toEqual(expect.objectContaining({
      inspectionId: 'INS-FAIL',
      equipmentCode: 'ASM-01',
      materialBatchCode: 'MAT-STEEL-A12',
      batchCode: 'WO-003-最终功能测试',
      defectQuantity: 1,
      reworkHours: 8,
      otdImpact: 'WO-003 延期 +2 单风险',
      rootCause: '尺寸超差 / 工序控制失稳',
    }))
    expect(buildQualityReworkImpact(fail).recommendedAction).toContain('冻结当前工序')
  })

  it('returns no quality rework inspection when all inspections pass', () => {
    expect(selectQualityReworkInspection([
      inspection({ result: 'pass' }),
    ])).toBeNull()
  })

  it('removes corrupt rework JSON so boards do not render stale quality impact', () => {
    localStorage.setItem('aimes_quality_rework_impact', '{bad json')

    expect(readQualityReworkImpact()).toBeNull()
    expect(localStorage.getItem('aimes_quality_rework_impact')).toBeNull()
  })

  it('removes incomplete rework impact that cannot explain OTD or evidence', () => {
    localStorage.setItem('aimes_quality_rework_impact', JSON.stringify({
      inspectionId: 'INS-003',
      workOrderId: 'WO-003',
      otdImpact: 'WO-003 延期 +1 单风险',
    }))

    expect(readQualityReworkImpact()).toBeNull()
    expect(localStorage.getItem('aimes_quality_rework_impact')).toBeNull()
  })
})

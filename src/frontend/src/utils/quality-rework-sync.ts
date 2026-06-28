import type { InspectionDto } from '../types/quality'

const QUALITY_REWORK_SYNC_KEY = 'aimes_quality_rework_impact'

export interface QualityReworkImpact {
  inspectionId: string
  workOrderId: string
  productCode: string
  processName: string
  equipmentCode: string
  materialBatchCode: string
  batchCode: string
  inspectionPoint: string
  defectQuantity: number
  reworkHours: number
  otdImpact: string
  recommendedAction: string
  rootCause: string
  evidence: string[]
  createdAt: string
}

const QUALITY_REWORK_STRING_FIELDS = [
  'inspectionId',
  'workOrderId',
  'productCode',
  'processName',
  'equipmentCode',
  'materialBatchCode',
  'batchCode',
  'inspectionPoint',
  'otdImpact',
  'recommendedAction',
  'rootCause',
  'createdAt',
] as const

function isQualityReworkImpact(value: unknown): value is QualityReworkImpact {
  if (!value || typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  return QUALITY_REWORK_STRING_FIELDS.every(field => typeof record[field] === 'string')
    && typeof record.defectQuantity === 'number'
    && typeof record.reworkHours === 'number'
    && Array.isArray(record.evidence)
    && record.evidence.every(item => typeof item === 'string')
}

export function writeQualityReworkImpact(impact: QualityReworkImpact) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(QUALITY_REWORK_SYNC_KEY, JSON.stringify(impact))
  void import('../api/qualityEvidence')
    .then(({ upsertQualityReworkImpact }) => upsertQualityReworkImpact(impact))
    .catch(() => undefined)
}

export function readQualityReworkImpact(): QualityReworkImpact | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(QUALITY_REWORK_SYNC_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (isQualityReworkImpact(parsed)) return parsed

    localStorage.removeItem(QUALITY_REWORK_SYNC_KEY)
    return null
  } catch {
    localStorage.removeItem(QUALITY_REWORK_SYNC_KEY)
    return null
  }
}

export async function readQualityReworkImpactBackendFirst(options?: { failLoud?: boolean }): Promise<QualityReworkImpact | null> {
  try {
    const { getLatestQualityReworkImpact } = await import('../api/qualityEvidence')
    const localRecord = readQualityReworkImpact()
    const record = await getLatestQualityReworkImpact(options)
    if (!isQualityReworkImpact(record)) return localRecord
    if (!localRecord) return record
    return new Date(localRecord.createdAt).getTime() >= new Date(record.createdAt).getTime()
      ? localRecord
      : record
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readQualityReworkImpact()
  }
}

export function buildQualityReworkImpact(inspection: InspectionDto): QualityReworkImpact {
  const isHardFail = inspection.result === 'fail'
  const defectQuantity = Math.max(inspection.defectQuantity, 1)
  const equipmentCode = inspection.processName.includes('热处理')
    ? 'HT-01'
    : inspection.processName.includes('装配')
      ? 'ASM-01'
      : 'CNC-01'
  const materialBatchCode = inspection.productCode.includes('PRD-003') ? 'MAT-AL6061-B03' : 'MAT-STEEL-A12'
  const batchCode = `${inspection.workOrderId}-${inspection.inspectionPoint.replace(/\s+/g, '').toUpperCase()}`
  return {
    inspectionId: inspection.id,
    workOrderId: inspection.workOrderId,
    productCode: inspection.productCode,
    processName: inspection.processName,
    equipmentCode,
    materialBatchCode,
    batchCode,
    inspectionPoint: inspection.inspectionPoint,
    defectQuantity,
    reworkHours: isHardFail ? 8 : 6,
    otdImpact: `${inspection.workOrderId} 延期 ${isHardFail ? '+2' : '+1'} 单风险`,
    recommendedAction: isHardFail
      ? '建议插入返工与复验窗口，冻结当前工序并复核设备、刀具和物料批次。'
      : '建议插入返工与复验窗口，锁定质检复验时间，并把相关热处理批次合并，降低二次换线。',
    rootCause: inspection.result === 'fail'
      ? '尺寸超差 / 工序控制失稳'
      : '硬度不足 / 热处理参数漂移',
    evidence: [
      `${inspection.inspectionPoint} 检验结果 ${inspection.result}`,
      `${equipmentCode} 关联工序 ${inspection.processName}`,
      `物料批次 ${materialBatchCode}`,
      `批次号 ${batchCode}`,
    ],
    createdAt: inspection.inspectedAt,
  }
}

export function selectQualityReworkInspection(inspections: InspectionDto[]): InspectionDto | null {
  const rework = inspections.find(item => item.result === 'rework')
  if (rework) return rework
  const fail = inspections.find(item => item.result === 'fail')
  return fail || null
}

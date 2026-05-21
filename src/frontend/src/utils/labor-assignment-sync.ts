import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const LABOR_REASSIGNMENT_KEY = 'aimes_labor_reassignment'
const LABOR_QUALIFICATION_BLOCK_KEY = 'aimes_labor_qualification_block'

export type LaborReassignmentStatus = 'approved' | 'executed'
export type LaborQualificationBlockStatus = 'active' | 'reviewing' | 'released'

export interface LaborReassignmentRecord {
  id: string
  workOrderNumber: string
  operationCode: string
  operationCodes: string[]
  operationName: string
  blockedEmployeeNumber: string
  blockedEmployeeName: string
  blockedCertification: string
  blockedExpiresAt: string
  replacementEmployeeNumber: string
  replacementEmployeeName: string
  replacementTeam: string
  replacementShift: string
  replacementSkill: string
  replacementCertification: string
  replacementExpiresAt: string
  reviewerEmployeeNumber: string
  reviewerName: string
  reviewerRole: string
  reason: string
  auditId: string
  traceId: string
  createdAt: string
  status: LaborReassignmentStatus
}

export interface LaborQualificationBlockRecord {
  id: string
  workOrderNumber: string
  operationCode: string
  operationCodes: string[]
  operationName: string
  blockedEmployeeNumber: string
  blockedEmployeeName: string
  blockedCertification: string
  blockedExpiresAt: string
  requiredSkill: string
  requiredTeam: string
  requiredShift: string
  reviewerEmployeeNumber: string
  reviewerName: string
  reviewerRole: string
  reason: string
  auditId: string
  traceId: string
  createdAt: string
  status: LaborQualificationBlockStatus
  reviewedAt?: string
  releasedAt?: string
  releaseAuditId?: string
  releaseTraceId?: string
  releaseReason?: string
}

export interface LaborReassignmentExecutionContext {
  operationCode: string
  operationName: string
  stationId: string
  equipmentId?: string
  reportedBy?: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isLaborReassignmentRecord(item: Partial<LaborReassignmentRecord> | null | undefined): item is LaborReassignmentRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.workOrderNumber === 'string'
    && typeof item.operationCode === 'string'
    && Array.isArray(item.operationCodes)
    && typeof item.operationName === 'string'
    && typeof item.blockedEmployeeNumber === 'string'
    && typeof item.blockedEmployeeName === 'string'
    && typeof item.blockedCertification === 'string'
    && typeof item.blockedExpiresAt === 'string'
    && typeof item.replacementEmployeeNumber === 'string'
    && typeof item.replacementEmployeeName === 'string'
    && typeof item.replacementTeam === 'string'
    && typeof item.replacementShift === 'string'
    && typeof item.replacementSkill === 'string'
    && typeof item.replacementCertification === 'string'
    && typeof item.replacementExpiresAt === 'string'
    && typeof item.reviewerEmployeeNumber === 'string'
    && typeof item.reviewerName === 'string'
    && typeof item.reviewerRole === 'string'
    && typeof item.reason === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.createdAt === 'string'
    && ['approved', 'executed'].includes(String(item.status))
}

function isLaborQualificationBlockRecord(item: Partial<LaborQualificationBlockRecord> | null | undefined): item is LaborQualificationBlockRecord {
  return !!item
    && typeof item.id === 'string'
    && typeof item.workOrderNumber === 'string'
    && typeof item.operationCode === 'string'
    && Array.isArray(item.operationCodes)
    && typeof item.operationName === 'string'
    && typeof item.blockedEmployeeNumber === 'string'
    && typeof item.blockedEmployeeName === 'string'
    && typeof item.blockedCertification === 'string'
    && typeof item.blockedExpiresAt === 'string'
    && typeof item.requiredSkill === 'string'
    && typeof item.requiredTeam === 'string'
    && typeof item.requiredShift === 'string'
    && typeof item.reviewerEmployeeNumber === 'string'
    && typeof item.reviewerName === 'string'
    && typeof item.reviewerRole === 'string'
    && typeof item.reason === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.createdAt === 'string'
    && ['active', 'reviewing', 'released'].includes(String(item.status))
}

function readRawLaborReassignments(): LaborReassignmentRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(LABOR_REASSIGNMENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isLaborReassignmentRecord) : []
  } catch {
    window.localStorage.removeItem(LABOR_REASSIGNMENT_KEY)
    return []
  }
}

function writeRawLaborReassignments(records: LaborReassignmentRecord[]) {
  if (!canUseStorage()) return
  if (!records.length) {
    window.localStorage.removeItem(LABOR_REASSIGNMENT_KEY)
    return
  }
  window.localStorage.setItem(LABOR_REASSIGNMENT_KEY, JSON.stringify(records.slice(0, 12)))
}

function readRawLaborQualificationBlocks(): LaborQualificationBlockRecord[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(LABOR_QUALIFICATION_BLOCK_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isLaborQualificationBlockRecord) : []
  } catch {
    window.localStorage.removeItem(LABOR_QUALIFICATION_BLOCK_KEY)
    return []
  }
}

function writeRawLaborQualificationBlocks(records: LaborQualificationBlockRecord[]) {
  if (!canUseStorage()) return
  if (!records.length) {
    window.localStorage.removeItem(LABOR_QUALIFICATION_BLOCK_KEY)
    return
  }
  window.localStorage.setItem(LABOR_QUALIFICATION_BLOCK_KEY, JSON.stringify(records.slice(0, 12)))
}

export function createDefaultLaborReassignment(
  createdAt = new Date().toISOString(),
  overrides: Partial<LaborReassignmentRecord> = {}
): LaborReassignmentRecord {
  const baseRecord: LaborReassignmentRecord = {
    id: 'labor-reassignment-WO-013-heat-treatment',
    workOrderNumber: 'WO-013',
    operationCode: 'OP-10',
    operationCodes: ['OP-10', 'OP-20'],
    operationName: '淬火 / 回火',
    blockedEmployeeNumber: 'EMP-003',
    blockedEmployeeName: '王五',
    blockedCertification: '热处理上岗证',
    blockedExpiresAt: '2026-05-25',
    replacementEmployeeNumber: 'EMP-006',
    replacementEmployeeName: '孙八',
    replacementTeam: '甲班',
    replacementShift: '白班',
    replacementSkill: '热处理替班复核 / 派工确认',
    replacementCertification: '班组长授权',
    replacementExpiresAt: '2026-09-30',
    reviewerEmployeeNumber: 'EMP-004',
    reviewerName: '赵六',
    reviewerRole: '工程放行',
    reason: 'EMP-003 热处理上岗证 2026-05-25 临期，WO-013 热处理工序改由 EMP-006 班组长接管开工复核，EMP-004 工程确认 SOP 与炉批。',
    auditId: 'AUD-LABOR-REASSIGN-20260520-001',
    traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
    createdAt,
    status: 'approved',
  }
  return { ...baseRecord, ...overrides }
}

export function createDefaultLaborQualificationBlock(
  createdAt = new Date().toISOString(),
  overrides: Partial<LaborQualificationBlockRecord> = {}
): LaborQualificationBlockRecord {
  const baseRecord: LaborQualificationBlockRecord = {
    id: 'labor-qualification-block-WO-013-heat-treatment',
    workOrderNumber: 'WO-013',
    operationCode: 'OP-10',
    operationCodes: ['OP-10', 'OP-20'],
    operationName: '淬火 / 回火',
    blockedEmployeeNumber: 'EMP-003',
    blockedEmployeeName: '王五',
    blockedCertification: '热处理上岗证',
    blockedExpiresAt: '2026-05-25',
    requiredSkill: '热处理',
    requiredTeam: '乙班',
    requiredShift: '夜班',
    reviewerEmployeeNumber: 'EMP-004',
    reviewerName: '赵六',
    reviewerRole: '工程放行',
    reason: 'EMP-003 王五的热处理上岗证 2026-05-25 临期；系统按热处理技能、同证书有效期、班组/班次与复核授权评分后未找到有效替班候选，WO-013 热处理必须停工复核。',
    auditId: 'AUD-LABOR-BLOCK-20260520-001',
    traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
    createdAt,
    status: 'active',
  }
  return { ...baseRecord, ...overrides }
}

export function readLaborReassignments(): LaborReassignmentRecord[] {
  return readRawLaborReassignments()
}

export function readLaborReassignment(): LaborReassignmentRecord | null {
  return readRawLaborReassignments()[0] ?? null
}

export function readLaborQualificationBlocks(): LaborQualificationBlockRecord[] {
  return readRawLaborQualificationBlocks()
}

export function readLaborQualificationBlock(): LaborQualificationBlockRecord | null {
  return readRawLaborQualificationBlocks().find(record => record.status !== 'released') ?? null
}

export function isLaborReassignmentForOperation(
  record: LaborReassignmentRecord,
  workOrderNumber: string,
  operationCode: string,
  operationName: string
) {
  const operationText = `${operationCode} ${operationName}`
  const isHeatTreatment = /热处理|淬火|回火/.test(operationText)
  return record.workOrderNumber === workOrderNumber
    && (record.operationCodes.includes(operationCode) || isHeatTreatment)
}

export function isLaborQualificationBlockForOperation(
  record: LaborQualificationBlockRecord,
  workOrderNumber: string,
  operationCode: string,
  operationName: string
) {
  const operationText = `${operationCode} ${operationName}`
  const isHeatTreatment = /热处理|淬火|回火/.test(operationText)
  return record.workOrderNumber === workOrderNumber
    && (record.operationCodes.includes(operationCode) || isHeatTreatment)
}

export function readLaborReassignmentForOperation(
  workOrderNumber: string,
  operationCode: string,
  operationName: string
): LaborReassignmentRecord | null {
  return readRawLaborReassignments().find(record =>
    isLaborReassignmentForOperation(record, workOrderNumber, operationCode, operationName)
  ) ?? null
}

export function readLaborQualificationBlockForOperation(
  workOrderNumber: string,
  operationCode: string,
  operationName: string
): LaborQualificationBlockRecord | null {
  return readRawLaborQualificationBlocks().find(record =>
    record.status !== 'released' &&
    isLaborQualificationBlockForOperation(record, workOrderNumber, operationCode, operationName)
  ) ?? null
}

export function writeLaborReassignment(record = createDefaultLaborReassignment()) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readRawLaborReassignments().filter(item => item.id !== record.id),
  ].slice(0, 12)
  writeRawLaborReassignments(next)
  writeRawLaborQualificationBlocks(readRawLaborQualificationBlocks().filter(item =>
    !isLaborQualificationBlockForOperation(item, record.workOrderNumber, record.operationCode, record.operationName)
  ))
  upsertOtdEvidenceChainRecord({
    id: `labor-reassignment-${record.id}`,
    stage: '人员替班',
    title: `${record.workOrderNumber} ${record.operationName} 资质临期替班已确认`,
    summary: `${record.blockedEmployeeNumber} ${record.blockedEmployeeName} 的 ${record.blockedCertification} 于 ${record.blockedExpiresAt} 临期；${record.replacementEmployeeNumber} ${record.replacementEmployeeName} 以 ${record.replacementCertification} 接管 ${record.replacementSkill}，${record.reviewerName} 负责 ${record.reviewerRole}。`,
    object: record.workOrderNumber,
    source: '人员管理 / 技能矩阵',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: '已替班',
    createdAt: record.createdAt,
  })
  return record
}

export function writeLaborQualificationBlock(record = createDefaultLaborQualificationBlock()) {
  if (!canUseStorage()) return record
  const next = [
    record,
    ...readRawLaborQualificationBlocks().filter(item => item.id !== record.id),
  ].slice(0, 12)
  writeRawLaborQualificationBlocks(next)
  writeRawLaborReassignments(readRawLaborReassignments().filter(item =>
    !isLaborReassignmentForOperation(item, record.workOrderNumber, record.operationCode, record.operationName)
  ))
  upsertOtdEvidenceChainRecord({
    id: `labor-qualification-block-${record.id}`,
    stage: '人员阻断',
    title: `${record.workOrderNumber} ${record.operationName} 无有效替班候选需停工复核`,
    summary: `${record.blockedEmployeeNumber} ${record.blockedEmployeeName} 的 ${record.blockedCertification} 于 ${record.blockedExpiresAt} 临期；${record.reason}`,
    object: record.workOrderNumber,
    source: '人员管理 / 技能矩阵',
    traceId: record.traceId,
    status: 'active',
    statusLabel: '停工复核',
    createdAt: record.createdAt,
  })
  return record
}

export function writeLaborQualificationBlockReview(record: LaborQualificationBlockRecord) {
  if (!canUseStorage()) return record
  const reviewedAt = new Date().toISOString()
  const nextRecord: LaborQualificationBlockRecord = {
    ...record,
    status: 'reviewing',
    reviewedAt,
  }
  writeRawLaborQualificationBlocks([
    nextRecord,
    ...readRawLaborQualificationBlocks().filter(item => item.id !== record.id),
  ])
  upsertOtdEvidenceChainRecord({
    id: `labor-qualification-review-${record.id}`,
    stage: '人员复核',
    title: `${record.workOrderNumber} ${record.operationName} 停工复核已由主管受理`,
    summary: `${record.reviewerEmployeeNumber} ${record.reviewerName} 已受理 ${record.blockedEmployeeNumber} ${record.blockedEmployeeName} 的 ${record.blockedCertification} 临期阻断，要求补充有效资质人员或调整排产窗口，复核完成前保持停工。`,
    object: record.workOrderNumber,
    source: '人员管理 / 主管复核',
    traceId: `${record.traceId}-REVIEW`,
    status: 'active',
    statusLabel: '主管复核中',
    createdAt: reviewedAt,
  })
  return nextRecord
}

export function releaseLaborQualificationBlock(
  block: LaborQualificationBlockRecord,
  reassignment: LaborReassignmentRecord,
  releaseReason: string
) {
  const releasedAt = new Date().toISOString()
  const releaseAuditId = reassignment.auditId
  const releaseTraceId = reassignment.traceId
  const releasedBlock: LaborQualificationBlockRecord = {
    ...block,
    status: 'released',
    releasedAt,
    releaseAuditId,
    releaseTraceId,
    releaseReason,
  }
  const writtenReassignment = writeLaborReassignment(reassignment)
  writeRawLaborQualificationBlocks([
    releasedBlock,
    ...readRawLaborQualificationBlocks().filter(item => item.id !== block.id),
  ])
  upsertOtdEvidenceChainRecord({
    id: `labor-qualification-release-${block.id}`,
    stage: '人员放行',
    title: `${block.workOrderNumber} ${block.operationName} 停工复核后重新放行`,
    summary: `${releaseAuditId} 已完成：${block.reviewerName} 确认补证/改派方案，${writtenReassignment.replacementEmployeeNumber} ${writtenReassignment.replacementEmployeeName} 以 ${writtenReassignment.replacementCertification} 接管 ${block.requiredSkill}，原阻断 ${block.auditId} 转为重新放行。${releaseReason}`,
    object: block.workOrderNumber,
    source: '人员管理 / 主管复核',
    traceId: releaseTraceId,
    status: 'closed',
    statusLabel: '重新放行',
    createdAt: releasedAt,
  })
  return { block: releasedBlock, reassignment: writtenReassignment }
}

export function writeLaborReassignmentExecutionEvidence(
  record: LaborReassignmentRecord,
  context: LaborReassignmentExecutionContext
) {
  const createdAt = new Date().toISOString()
  const equipmentText = context.equipmentId || '未指定设备'
  const reportedBy = context.reportedBy || 'operator'
  upsertOtdEvidenceChainRecord({
    id: `labor-reassignment-start-${record.workOrderNumber}-${context.operationCode}`,
    stage: '生产开工',
    title: `${record.workOrderNumber} ${context.operationName} 替班后开工`,
    summary: `${record.auditId} 已执行：${record.replacementEmployeeNumber} ${record.replacementEmployeeName} 在 ${context.stationId} / ${equipmentText} 接管 ${record.blockedEmployeeNumber} ${record.blockedEmployeeName} 的临期资质风险，${record.reviewerName} 保留工程复核。`,
    object: record.workOrderNumber,
    source: `生产报工 / ${reportedBy}`,
    traceId: `${record.traceId}-START`,
    status: 'closed',
    statusLabel: '替班已执行',
    createdAt,
  })
}

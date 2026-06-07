import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const ALTERNATE_MATERIAL_APPROVAL_KEY = 'aimes_alternate_material_approval'
const ROUTE_CAPABILITY_VALIDATION_KEY = 'aimes_route_capability_validation'
const ENGINEERING_CHANGE_IMPACT_KEY = 'aimes_engineering_change_impact_analysis'

export type EngineeringChangeDecision = 'pending' | 'approved' | 'rejected'

export interface AlternateMaterialApproval {
  id: string
  bomCode: string
  bomVersion: string
  sourceMaterialCode: string
  alternateMaterialCode: string
  alternateMaterialName: string
  affectedOrders: string
  approvedBy: string
  approvedAt: string
  auditId: string
  traceId: string
  status: 'approved'
  summary: string
}

export interface RouteCapabilityValidation {
  id: string
  routeCode: string
  routeVersion: string
  routeName: string
  operationCode: string
  operationName: string
  bottleneckResource: string
  candidateEquipment: string
  affectedOrders: string
  capacityGapHours: number
  changeoverMinutes: number
  batchWindow: string
  decision: 'validated' | 'released'
  validatedBy: string
  validatedAt: string
  approvedBy?: string
  approvedAt?: string
  auditId: string
  traceId: string
  statusLabel: string
  summary: string
}

export interface EngineeringChangeImpactAnalysis {
  id: string
  changeId: string
  bomCode: string
  bomVersion: string
  changeTitle: string
  sourceMaterialCode: string
  alternateMaterialCode: string
  alternateMaterialName: string
  affectedOrders: string
  inventoryImpact: string
  qualityImpact: string
  supplierImpact: string
  costImpact: string
  otdImpact: string
  scheduleWindow: string
  recommendedDecision: string
  analyzedBy: string
  analyzedAt: string
  auditId: string
  traceId: string
  decision: EngineeringChangeDecision
  decisionLabel: string
  decidedBy?: string
  decidedAt?: string
  decisionReason?: string
  decisionAuditId?: string
  statusLabel: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isEngineeringChangeDecision(value: unknown): value is EngineeringChangeDecision {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

function isAlternateMaterialApproval(value: unknown): value is AlternateMaterialApproval {
  if (!value || typeof value !== 'object') return false
  const approval = value as Partial<AlternateMaterialApproval>
  return hasText(approval.id)
    && hasText(approval.bomCode)
    && hasText(approval.bomVersion)
    && hasText(approval.sourceMaterialCode)
    && hasText(approval.alternateMaterialCode)
    && hasText(approval.alternateMaterialName)
    && hasText(approval.affectedOrders)
    && hasText(approval.approvedBy)
    && hasText(approval.approvedAt)
    && hasText(approval.auditId)
    && hasText(approval.traceId)
    && approval.status === 'approved'
    && hasText(approval.summary)
}

function isEngineeringChangeImpactAnalysis(value: unknown): value is EngineeringChangeImpactAnalysis {
  if (!value || typeof value !== 'object') return false
  const impact = value as Partial<EngineeringChangeImpactAnalysis>
  return hasText(impact.id)
    && hasText(impact.changeId)
    && hasText(impact.bomCode)
    && hasText(impact.bomVersion)
    && hasText(impact.changeTitle)
    && hasText(impact.sourceMaterialCode)
    && hasText(impact.alternateMaterialCode)
    && hasText(impact.alternateMaterialName)
    && hasText(impact.affectedOrders)
    && hasText(impact.inventoryImpact)
    && hasText(impact.qualityImpact)
    && hasText(impact.supplierImpact)
    && hasText(impact.costImpact)
    && hasText(impact.otdImpact)
    && hasText(impact.scheduleWindow)
    && hasText(impact.recommendedDecision)
    && hasText(impact.analyzedBy)
    && hasText(impact.analyzedAt)
    && hasText(impact.auditId)
    && hasText(impact.traceId)
    && isEngineeringChangeDecision(impact.decision)
    && hasText(impact.decisionLabel)
    && hasText(impact.statusLabel)
    && hasText(impact.summary)
}

function isRouteCapabilityValidation(value: unknown): value is RouteCapabilityValidation {
  if (!value || typeof value !== 'object') return false
  const validation = value as Partial<RouteCapabilityValidation>
  return hasText(validation.id)
    && hasText(validation.routeCode)
    && hasText(validation.routeVersion)
    && hasText(validation.routeName)
    && hasText(validation.operationCode)
    && hasText(validation.operationName)
    && hasText(validation.bottleneckResource)
    && hasText(validation.candidateEquipment)
    && hasText(validation.affectedOrders)
    && typeof validation.capacityGapHours === 'number'
    && typeof validation.changeoverMinutes === 'number'
    && hasText(validation.batchWindow)
    && (validation.decision === 'validated' || validation.decision === 'released')
    && hasText(validation.validatedBy)
    && hasText(validation.validatedAt)
    && hasText(validation.auditId)
    && hasText(validation.traceId)
    && hasText(validation.statusLabel)
    && hasText(validation.summary)
}

function engineeringChangeDecisionLabel(decision: EngineeringChangeDecision) {
  if (decision === 'approved') return '已批准'
  if (decision === 'rejected') return '已驳回'
  return '待工程审批'
}

function normalizeEngineeringChangeImpact(input: Partial<EngineeringChangeImpactAnalysis>): EngineeringChangeImpactAnalysis | null {
  if (!input?.changeId || !input?.traceId) return null
  const inferredDecision: EngineeringChangeDecision = input.decision
    ?? (input.statusLabel === '已批准' ? 'approved' : input.statusLabel === '已驳回' ? 'rejected' : 'pending')
  const decisionLabel = input.decisionLabel ?? input.statusLabel ?? engineeringChangeDecisionLabel(inferredDecision)
  return {
    id: input.id ?? 'engineering-change-impact-bom-a100-al6061b',
    changeId: input.changeId,
    bomCode: input.bomCode ?? 'BOM-A100',
    bomVersion: input.bomVersion ?? 'V1.0',
    changeTitle: input.changeTitle ?? 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析',
    sourceMaterialCode: input.sourceMaterialCode ?? 'M-AL-6061',
    alternateMaterialCode: input.alternateMaterialCode ?? 'M-AL-6061B',
    alternateMaterialName: input.alternateMaterialName ?? '铝合金 6061B',
    affectedOrders: input.affectedOrders ?? 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005',
    inventoryImpact: input.inventoryImpact ?? 'M-AL-6061 当前缺口 19 件，M-AL-6061B 可用 28 件，可覆盖急单与 WO-DEMO-1002 的 CNC 后段需求。',
    qualityImpact: input.qualityImpact ?? '替代料必须保留首件材质复核、OP-040 扭矩检验和批次追溯，不允许压缩质量门。',
    supplierImpact: input.supplierImpact ?? '华东快供二厂批次 B-6061B-0521 已承诺 2026-05-21 16:00 到料，原供应商延期风险保留复核。',
    costImpact: input.costImpact ?? '材料成本 +1.8%，低于急单延期罚金和夜班加班综合成本。',
    otdImpact: input.otdImpact ?? 'Agent 模拟 OTD +7%，预计减少 1 单延期风险。',
    scheduleWindow: input.scheduleWindow ?? '锁定期后第一个 CNC 空窗',
    recommendedDecision: input.recommendedDecision ?? '建议先放行 WO-RUSH-9001 / WO-DEMO-1002，WO-DEMO-1005 保持原物料策略并等待正式 ECN 审批。',
    analyzedBy: input.analyzedBy ?? '工程经理 / EMP-004',
    analyzedAt: input.analyzedAt ?? new Date().toISOString(),
    auditId: input.auditId ?? 'AUD-ENG-ECN-20260521-001',
    traceId: input.traceId,
    decision: inferredDecision,
    decisionLabel,
    decidedBy: input.decidedBy,
    decidedAt: input.decidedAt,
    decisionReason: input.decisionReason,
    decisionAuditId: input.decisionAuditId,
    statusLabel: input.statusLabel ?? decisionLabel,
    summary: input.summary ?? '已完成库存、质量参数、供应商批次、成本和 OTD 影响测算，允许 AI 排产生成审批前模拟方案。',
  }
}

function upsertEngineeringChangeEvidence(record: EngineeringChangeImpactAnalysis) {
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '工程变更影响',
    title: `${record.changeId} 替代料影响分析已生成`,
    summary: `${record.summary} 库存：${record.inventoryImpact} 质量：${record.qualityImpact} 供应：${record.supplierImpact} 成本：${record.costImpact} OTD：${record.otdImpact}`,
    object: `${record.bomCode} ${record.bomVersion} / ${record.alternateMaterialCode}`,
    source: 'BOM 管理 / 工程变更影响分析',
    traceId: record.traceId,
    status: record.decision === 'pending' ? 'active' : 'closed',
    statusLabel: record.statusLabel,
    createdAt: record.analyzedAt,
  })

  if (record.decision === 'pending') return

  const approved = record.decision === 'approved'
  upsertOtdEvidenceChainRecord({
    id: `${record.id}-${record.decision}`,
    stage: approved ? '工程变更批准' : '工程变更驳回',
    title: approved
      ? `${record.changeId} 正式批准并释放替代料`
      : `${record.changeId} 工程变更已驳回`,
    summary: approved
      ? `${record.decisionReason ?? '工程已批准替代料策略。'} 正式释放 WO-RUSH-9001 / WO-DEMO-1002 的替代料排产窗口；${record.qualityImpact}`
      : `${record.decisionReason ?? '工程驳回替代料策略。'} 撤回审批前模拟，${record.affectedOrders} 保持 ${record.sourceMaterialCode} 原物料策略并等待采购/原料到货。`,
    object: `${record.bomCode} ${record.bomVersion} / ${record.alternateMaterialCode}`,
    source: 'BOM 管理 / ECN 审批',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: record.statusLabel,
    createdAt: record.decidedAt ?? record.analyzedAt,
  })
}

function persistEngineeringChangeImpactAnalysis(record: EngineeringChangeImpactAnalysis) {
  if (!canUseStorage()) return null
  window.localStorage.setItem(ENGINEERING_CHANGE_IMPACT_KEY, JSON.stringify(record))
  void import('../api/engineeringEvidence')
    .then(({ upsertEngineeringChangeImpact }) => upsertEngineeringChangeImpact(record))
    .catch(() => undefined)
  upsertEngineeringChangeEvidence(record)
  return record
}

export function writeAlternateMaterialApproval(input?: Partial<AlternateMaterialApproval>) {
  if (!canUseStorage()) return null
  const approvedAt = input?.approvedAt ?? new Date().toISOString()
  const record: AlternateMaterialApproval = {
    id: input?.id ?? 'alt-mat-approval-bom-a100-al6061b',
    bomCode: input?.bomCode ?? 'BOM-A100',
    bomVersion: input?.bomVersion ?? 'V1.0',
    sourceMaterialCode: input?.sourceMaterialCode ?? 'M-AL-6061',
    alternateMaterialCode: input?.alternateMaterialCode ?? 'M-AL-6061B',
    alternateMaterialName: input?.alternateMaterialName ?? '铝合金 6061B',
    affectedOrders: input?.affectedOrders ?? 'WO-RUSH-9001 / WO-DEMO-1002',
    approvedBy: input?.approvedBy ?? '工程师 / EMP-004',
    approvedAt,
    auditId: input?.auditId ?? 'AUD-ENG-ALT-20260520-001',
    traceId: input?.traceId ?? 'TRACE-ENG-ALT-BOM-A100-M-AL-6061B',
    status: 'approved',
    summary: input?.summary ?? '替代料 M-AL-6061B 已完成工程确认，可释放 M-AL-6061 缺料导致的 CNC 后段冻结约束。',
  }

  window.localStorage.setItem(ALTERNATE_MATERIAL_APPROVAL_KEY, JSON.stringify(record))
  void import('../api/engineeringEvidence')
    .then(({ upsertAlternateMaterialApproval }) => upsertAlternateMaterialApproval(record))
    .catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: '工程放行',
    title: `${record.alternateMaterialCode} 替代 ${record.sourceMaterialCode} 已工程确认`,
    summary: `${record.summary} 影响工单：${record.affectedOrders}；审批人：${record.approvedBy}。`,
    object: `${record.bomCode} ${record.bomVersion}`,
    source: 'BOM 管理 / 替代料确认',
    traceId: record.traceId,
    status: 'closed',
    statusLabel: '已放行',
    createdAt: record.approvedAt,
  })
  return record
}

export function readAlternateMaterialApproval(): AlternateMaterialApproval | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(ALTERNATE_MATERIAL_APPROVAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isAlternateMaterialApproval(parsed)) return parsed
    window.localStorage.removeItem(ALTERNATE_MATERIAL_APPROVAL_KEY)
    return null
  } catch {
    window.localStorage.removeItem(ALTERNATE_MATERIAL_APPROVAL_KEY)
    return null
  }
}

export async function readAlternateMaterialApprovalBackendFirst(): Promise<AlternateMaterialApproval | null> {
  try {
    const { getLatestAlternateMaterialApproval } = await import('../api/engineeringEvidence')
    return await getLatestAlternateMaterialApproval() ?? readAlternateMaterialApproval()
  } catch {
    return readAlternateMaterialApproval()
  }
}

export function writeEngineeringChangeImpactAnalysis(input?: Partial<EngineeringChangeImpactAnalysis>) {
  if (!canUseStorage()) return null
  const analyzedAt = input?.analyzedAt ?? new Date().toISOString()
  const decision = input?.decision ?? 'pending'
  const decisionLabel = input?.decisionLabel ?? engineeringChangeDecisionLabel(decision)
  const record: EngineeringChangeImpactAnalysis = {
    id: input?.id ?? 'engineering-change-impact-bom-a100-al6061b',
    changeId: input?.changeId ?? 'ECN-BOM-A100-6061B-20260521',
    bomCode: input?.bomCode ?? 'BOM-A100',
    bomVersion: input?.bomVersion ?? 'V1.0',
    changeTitle: input?.changeTitle ?? 'M-AL-6061B 替代 M-AL-6061 工程变更影响分析',
    sourceMaterialCode: input?.sourceMaterialCode ?? 'M-AL-6061',
    alternateMaterialCode: input?.alternateMaterialCode ?? 'M-AL-6061B',
    alternateMaterialName: input?.alternateMaterialName ?? '铝合金 6061B',
    affectedOrders: input?.affectedOrders ?? 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005',
    inventoryImpact: input?.inventoryImpact ?? 'M-AL-6061 当前缺口 19 件，M-AL-6061B 可用 28 件，可覆盖急单与 WO-DEMO-1002 的 CNC 后段需求。',
    qualityImpact: input?.qualityImpact ?? '替代料必须保留首件材质复核、OP-040 扭矩检验和批次追溯，不允许压缩质量门。',
    supplierImpact: input?.supplierImpact ?? '华东快供二厂批次 B-6061B-0521 已承诺 2026-05-21 16:00 到料，原供应商延期风险保留复核。',
    costImpact: input?.costImpact ?? '材料成本 +1.8%，低于急单延期罚金和夜班加班综合成本。',
    otdImpact: input?.otdImpact ?? 'Agent 模拟 OTD +7%，预计减少 1 单延期风险。',
    scheduleWindow: input?.scheduleWindow ?? '锁定期后第一个 CNC 空窗',
    recommendedDecision: input?.recommendedDecision ?? '建议先放行 WO-RUSH-9001 / WO-DEMO-1002，WO-DEMO-1005 保持原物料策略并等待正式 ECN 审批。',
    analyzedBy: input?.analyzedBy ?? '工程经理 / EMP-004',
    analyzedAt,
    auditId: input?.auditId ?? 'AUD-ENG-ECN-20260521-001',
    traceId: input?.traceId ?? 'TRACE-ENG-ECN-BOM-A100-6061B',
    decision,
    decisionLabel,
    decidedBy: input?.decidedBy,
    decidedAt: input?.decidedAt,
    decisionReason: input?.decisionReason,
    decisionAuditId: input?.decisionAuditId,
    statusLabel: input?.statusLabel ?? decisionLabel,
    summary: input?.summary ?? '已完成库存、质量参数、供应商批次、成本和 OTD 影响测算，允许 AI 排产生成审批前模拟方案。',
  }

  return persistEngineeringChangeImpactAnalysis(record)
}

export function readEngineeringChangeImpactAnalysis(): EngineeringChangeImpactAnalysis | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(ENGINEERING_CHANGE_IMPACT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isEngineeringChangeImpactAnalysis(parsed)) return normalizeEngineeringChangeImpact(parsed)
    window.localStorage.removeItem(ENGINEERING_CHANGE_IMPACT_KEY)
    return null
  } catch {
    window.localStorage.removeItem(ENGINEERING_CHANGE_IMPACT_KEY)
    return null
  }
}

export async function readEngineeringChangeImpactAnalysisBackendFirst(): Promise<EngineeringChangeImpactAnalysis | null> {
  try {
    const { getLatestEngineeringChangeImpact } = await import('../api/engineeringEvidence')
    const record = await getLatestEngineeringChangeImpact()
    return record ? normalizeEngineeringChangeImpact(record) : readEngineeringChangeImpactAnalysis()
  } catch {
    return readEngineeringChangeImpactAnalysis()
  }
}

export function approveEngineeringChangeImpactAnalysis(input?: {
  decidedBy?: string
  decidedAt?: string
  decisionReason?: string
}) {
  const current = readEngineeringChangeImpactAnalysis()
  if (!current) return null
  const decidedAt = input?.decidedAt ?? new Date().toISOString()
  return persistEngineeringChangeImpactAnalysis({
    ...current,
    decision: 'approved',
    decisionLabel: '已批准',
    decidedBy: input?.decidedBy ?? '工程经理 / EMP-004',
    decidedAt,
    decisionReason: input?.decisionReason ?? '替代料库存、质量门和供应批次均满足急单释放条件。',
    decisionAuditId: current.decisionAuditId ?? 'AUD-ENG-ECN-20260521-APPROVE',
    statusLabel: '已批准',
    summary: 'ECN 已完成正式审批，允许 AI 排产把审批前模拟转为正式替代料释放方案。',
  })
}

export function rejectEngineeringChangeImpactAnalysis(input?: {
  decidedBy?: string
  decidedAt?: string
  decisionReason?: string
}) {
  const current = readEngineeringChangeImpactAnalysis()
  if (!current) return null
  const decidedAt = input?.decidedAt ?? new Date().toISOString()
  return persistEngineeringChangeImpactAnalysis({
    ...current,
    decision: 'rejected',
    decisionLabel: '已驳回',
    decidedBy: input?.decidedBy ?? '工程经理 / EMP-004',
    decidedAt,
    decisionReason: input?.decisionReason ?? '替代料批次仍需补充材质证明，暂不允许进入正式排产。',
    decisionAuditId: current.decisionAuditId ?? 'AUD-ENG-ECN-20260521-REJECT',
    statusLabel: '已驳回',
    summary: 'ECN 已驳回，审批前模拟撤回，相关工单保持原物料策略并等待采购或工程补证。',
  })
}

export function writeRouteCapabilityValidation(input?: Partial<RouteCapabilityValidation>) {
  if (!canUseStorage()) return null
  const decision = input?.decision ?? 'validated'
  const validatedAt = input?.validatedAt ?? new Date().toISOString()
  const approvedAt = decision === 'released' ? (input?.approvedAt ?? validatedAt) : input?.approvedAt
  const record: RouteCapabilityValidation = {
    id: input?.id ?? 'route-capability-rb200-op090',
    routeCode: input?.routeCode ?? 'R-B200',
    routeVersion: input?.routeVersion ?? 'V2.1',
    routeName: input?.routeName ?? '传动轴总成工艺路线',
    operationCode: input?.operationCode ?? 'OP-090',
    operationName: input?.operationName ?? '热处理',
    bottleneckResource: input?.bottleneckResource ?? '热处理炉 HT-01',
    candidateEquipment: input?.candidateEquipment ?? 'HT-02 夜班窗口 / 外协 HT-SUP-01',
    affectedOrders: input?.affectedOrders ?? 'WO-DEMO-1007 / WO-DEMO-1010 / WO-RUSH-9001',
    capacityGapHours: input?.capacityGapHours ?? 4.5,
    changeoverMinutes: input?.changeoverMinutes ?? 35,
    batchWindow: input?.batchWindow ?? '2026-05-21 22:00-02:00',
    decision,
    validatedBy: input?.validatedBy ?? '工艺工程师 陈工',
    validatedAt,
    approvedBy: decision === 'released' ? (input?.approvedBy ?? '制造经理 李工') : input?.approvedBy,
    approvedAt,
    auditId: input?.auditId ?? 'AUD-ROUTE-CAP-20260521-001',
    traceId: input?.traceId ?? 'TRACE-ROUTE-CAP-R-B200-OP-090',
    statusLabel: input?.statusLabel ?? (decision === 'released' ? '分流已确认' : '瓶颈已校验'),
    summary: input?.summary ?? (decision === 'released'
      ? 'R-B200 OP-090 热处理能力缺口已确认分流/合批方案，HT-02 夜班窗口和外协兜底可进入 AI 排产复核。'
      : 'R-B200 OP-090 热处理炉能力存在 4.5h 缺口，需确认 HT-02 夜班窗口或外协兜底后再释放排产。'),
  }

  window.localStorage.setItem(ROUTE_CAPABILITY_VALIDATION_KEY, JSON.stringify(record))
  void import('../api/engineeringEvidence')
    .then(({ upsertRouteCapabilityValidation }) => upsertRouteCapabilityValidation(record))
    .catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: record.id,
    stage: decision === 'released' ? '工艺能力放行' : '工艺能力校验',
    title: `${record.routeCode} ${record.operationCode} ${record.operationName}能力${decision === 'released' ? '分流/合批已确认' : '缺口已校验'}`,
    summary: `${record.summary} 影响工单：${record.affectedOrders}；能力缺口 ${record.capacityGapHours}h；候选资源：${record.candidateEquipment}。`,
    object: `${record.routeCode} ${record.routeVersion} / ${record.operationCode}`,
    source: '工艺路线 / 能力校验',
    traceId: record.traceId,
    status: decision === 'released' ? 'closed' : 'active',
    statusLabel: record.statusLabel,
    createdAt: approvedAt ?? record.validatedAt,
  })
  return record
}

export function readRouteCapabilityValidation(): RouteCapabilityValidation | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(ROUTE_CAPABILITY_VALIDATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isRouteCapabilityValidation(parsed)) return parsed
    window.localStorage.removeItem(ROUTE_CAPABILITY_VALIDATION_KEY)
    return null
  } catch {
    window.localStorage.removeItem(ROUTE_CAPABILITY_VALIDATION_KEY)
    return null
  }
}

export async function readRouteCapabilityValidationBackendFirst(options?: { failLoud?: boolean }): Promise<RouteCapabilityValidation | null> {
  try {
    const { getLatestRouteCapabilityValidation } = await import('../api/engineeringEvidence')
    return await getLatestRouteCapabilityValidation(options) ?? readRouteCapabilityValidation()
  } catch (error) {
    if (options?.failLoud) throw error
    return readRouteCapabilityValidation()
  }
}

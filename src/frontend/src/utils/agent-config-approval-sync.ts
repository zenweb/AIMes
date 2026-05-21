const STORAGE_KEY = 'aimes_agent_config_approvals'

export type AgentConfigApprovalStatus = 'pending' | 'reviewing' | 'approved' | 'rejected'

export interface AgentConfigApprovalRecord {
  id: string
  title: string
  replayTitle: string
  configKey: string
  fromValue: string
  toValue: string
  reason: string
  owner: string
  status: AgentConfigApprovalStatus
  auditId: string
  submittedBy: string
  submittedAt: string
  risk: string
  decidedBy?: string
  decidedAt?: string
  policyArea?: 'scheduling' | 'ai' | 'quality'
  policyMetrics?: Array<{
    label: string
    fromValue: string
    toValue: string
  }>
  controlSummary?: string
}

export interface QualityExperimentExpansionGatePolicy {
  approvalId: string
  configKey: string
  auditId: string
  status: AgentConfigApprovalStatus
  statusLabel: string
  adoptionRateMin: number
  recheckPassRateMin: number
  falseRecallMax: number
  thresholdLabel: string
  policyLabel: string
  auditLabel: string
  effective: boolean
}

export const QUALITY_EXPERIMENT_GATE_APPROVAL_ID = 'cfg-quality-experiment-gate'

const DEFAULT_APPROVALS: AgentConfigApprovalRecord[] = [
  {
    id: 'cfg-lock-window',
    title: 'Scheduling.LockWindowHours 8h -> 10h',
    replayTitle: '锁定期保护从 8 小时调整为 10 小时',
    configKey: 'Scheduling.LockWindowHours',
    fromValue: '8h',
    toValue: '10h',
    reason: '客户要求冻结当天早班计划，降低现场频繁换线。',
    owner: '生产经理审批',
    status: 'pending',
    auditId: 'TRACE-CFG-20260520-002',
    submittedBy: 'admin',
    submittedAt: '2026-05-20T10:30:00.000Z',
    risk: '锁定期扩大可能降低急单响应速度。',
  },
  {
    id: 'cfg-llm-threshold',
    title: 'Agent 自动建议置信度阈值 0.72 -> 0.80',
    replayTitle: 'Agent 自动建议置信度阈值从 0.72 调整为 0.80',
    configKey: 'Agent.RecommendationConfidenceThreshold',
    fromValue: '0.72',
    toValue: '0.80',
    reason: '降低低置信建议进入调度员队列的概率。',
    owner: 'MES 管理员复核',
    status: 'reviewing',
    auditId: 'TRACE-CFG-20260520-003',
    submittedBy: 'admin',
    submittedAt: '2026-05-20T10:34:00.000Z',
    risk: '置信度阈值提高会减少低置信建议，但也可能漏掉少量可用排产方案。',
    policyArea: 'ai',
  },
  {
    id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
    title: '质量推荐实验扩大门禁 复验 100% -> >=95%',
    replayTitle: '质量推荐实验扩大门禁复验通过率从 100% 调整为 95%',
    configKey: 'Quality.RecommendationExperimentExpansionGate',
    fromValue: '采纳率 100% / 复验通过率 100% / 误召回 0 次',
    toValue: '采纳率 100% / 复验通过率 >=95% / 误召回 0 次',
    reason: 'R4 同设备族实验复验 98%、误召回 0 次，允许在质量主管审批后扩大；低于 95% 或出现误召回仍自动回滚。',
    owner: '质量主管 / 知识库管理员',
    status: 'reviewing',
    auditId: 'TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001',
    submittedBy: 'admin',
    submittedAt: '2026-05-21T18:20:00.000Z',
    risk: '复验阈值放宽可能让边界样本更早进入推荐扩大，必须绑定误召回 0 次、R5 回滚负样本和质量主管审批。',
    policyArea: 'quality',
    policyMetrics: [
      { label: '推荐采纳率', fromValue: '100%', toValue: '100%' },
      { label: '复验通过率', fromValue: '100%', toValue: '>=95%' },
      { label: '负样本误召回', fromValue: '0 次', toValue: '0 次' },
    ],
    controlSummary: '审批通过后，R4/R6/R7 扩大灰度必须同时满足推荐采纳率 100%、复验通过率 >=95%、负样本误召回 0 次，并保留质量主管确认。',
  },
]

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function readOverrides(): Partial<AgentConfigApprovalRecord>[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeOverrides(records: AgentConfigApprovalRecord[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function readAgentConfigApprovals(): AgentConfigApprovalRecord[] {
  const overrides = readOverrides()
  return DEFAULT_APPROVALS.map(defaultRecord => {
    const override = overrides.find(item => item.id === defaultRecord.id)
    return override ? { ...defaultRecord, ...override } : { ...defaultRecord }
  })
}

export function decideAgentConfigApproval(
  id: string,
  decision: Extract<AgentConfigApprovalStatus, 'approved' | 'rejected'>,
  actor = 'admin',
) {
  const records = readAgentConfigApprovals()
  const nextRecords = records.map(record => (
    record.id === id
      ? { ...record, status: decision, decidedBy: actor, decidedAt: new Date().toISOString() }
      : record
  ))
  writeOverrides(nextRecords)
  return nextRecords.find(record => record.id === id) ?? null
}

export function approvalStatusLabel(status: AgentConfigApprovalStatus) {
  const labels: Record<AgentConfigApprovalStatus, string> = {
    pending: '待审批',
    reviewing: '复核中',
    approved: '已通过',
    rejected: '已驳回',
  }
  return labels[status]
}

export function isApprovalOpen(status: AgentConfigApprovalStatus) {
  return status === 'pending' || status === 'reviewing'
}

export function readQualityExperimentExpansionGatePolicy(
  approvals: AgentConfigApprovalRecord[] = readAgentConfigApprovals()
): QualityExperimentExpansionGatePolicy {
  const approval = approvals.find(record => record.id === QUALITY_EXPERIMENT_GATE_APPROVAL_ID)
  const effective = approval?.status === 'approved'
  const status = approval?.status ?? 'pending'
  const recheckPassRateMin = effective ? 95 : 100
  const thresholdLabel = effective
    ? '采纳 >=100% / 复验 >=95% / 误召回 <=0 次'
    : '采纳 >=100% / 复验 100% / 误召回 <=0 次'
  const statusLabel = approvalStatusLabel(status)

  return {
    approvalId: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
    configKey: approval?.configKey ?? 'Quality.RecommendationExperimentExpansionGate',
    auditId: approval?.auditId ?? 'TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001',
    status,
    statusLabel,
    adoptionRateMin: 100,
    recheckPassRateMin,
    falseRecallMax: 0,
    thresholdLabel,
    policyLabel: `${thresholdLabel} / ${statusLabel}`,
    auditLabel: `${approval?.auditId ?? 'TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001'} / ${statusLabel}`,
    effective,
  }
}

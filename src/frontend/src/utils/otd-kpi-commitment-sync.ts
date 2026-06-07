import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { getLatestOtdKpiCommitment, queryOtdKpiCommitments, upsertOtdKpiCommitment } from '../api/otdKpiCommitmentEvidence'

const STORAGE_KEY = 'aimes_otd_kpi_commitment_packages'
const MAX_RECORDS = 8

export interface OtdKpiCommitmentAction {
  module: string
  owner: string
  action: string
  evidence: string
}

export interface OtdKpiCommitmentPackage {
  id: string
  sourceKpiId: string
  dimensionLabel: string
  targetName: string
  title: string
  auditId: string
  traceId: string
  actor: string
  baselineOtd: number
  agentOtd: number
  lift: number
  delayedReduced: number
  statusLabel: string
  commitment: string
  owner: string
  dueAt: string
  summary: string
  actions: OtdKpiCommitmentAction[]
  createdAt: string
}

interface WriteOtdKpiCommitmentPackageInput {
  sourceKpiId: string
  dimensionLabel: string
  targetName: string
  baselineOtd: number
  agentOtd: number
  lift: number
  delayedReduced: number
  statusLabel: string
  driver: string
  nextActions: string[]
  sourceTraceId: string
  actor: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isCommitmentAction(item: Partial<OtdKpiCommitmentAction> | null | undefined): item is OtdKpiCommitmentAction {
  return !!item
    && typeof item.module === 'string'
    && typeof item.owner === 'string'
    && typeof item.action === 'string'
    && typeof item.evidence === 'string'
}

function isCommitmentPackage(item: Partial<OtdKpiCommitmentPackage> | null | undefined): item is OtdKpiCommitmentPackage {
  return !!item
    && typeof item.id === 'string'
    && typeof item.sourceKpiId === 'string'
    && typeof item.dimensionLabel === 'string'
    && typeof item.targetName === 'string'
    && typeof item.title === 'string'
    && typeof item.auditId === 'string'
    && typeof item.traceId === 'string'
    && typeof item.actor === 'string'
    && typeof item.baselineOtd === 'number'
    && typeof item.agentOtd === 'number'
    && typeof item.lift === 'number'
    && typeof item.delayedReduced === 'number'
    && typeof item.statusLabel === 'string'
    && typeof item.commitment === 'string'
    && typeof item.owner === 'string'
    && typeof item.dueAt === 'string'
    && typeof item.summary === 'string'
    && Array.isArray(item.actions)
    && item.actions.length > 0
    && item.actions.every(isCommitmentAction)
    && typeof item.createdAt === 'string'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readRawPackages(): OtdKpiCommitmentPackage[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY)
      return []
    }
    const records = parsed.filter(isCommitmentPackage)
    if (records.length !== parsed.length) {
      if (records.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
    return records
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export function readOtdKpiCommitmentPackages(): OtdKpiCommitmentPackage[] {
  return readRawPackages()
}

export async function readOtdKpiCommitmentPackagesBackendFirst(): Promise<OtdKpiCommitmentPackage[]> {
  const records = await queryOtdKpiCommitments()
  return records.length > 0 ? records : readOtdKpiCommitmentPackages()
}

export function readLatestOtdKpiCommitmentPackage(): OtdKpiCommitmentPackage | null {
  return readRawPackages()[0] ?? null
}

export async function readLatestOtdKpiCommitmentPackageBackendFirst(): Promise<OtdKpiCommitmentPackage | null> {
  const record = await getLatestOtdKpiCommitment()
  return record ?? readLatestOtdKpiCommitmentPackage()
}

export function writeOtdKpiCommitmentPackage(input: WriteOtdKpiCommitmentPackageInput): OtdKpiCommitmentPackage {
  const createdAt = new Date().toISOString()
  const suffix = slugify(input.sourceKpiId) || 'kpi'
  const auditId = input.sourceKpiId === 'customer-huadong'
    ? 'AUD-KPI-COMMITMENT-HUADONG-20260521-001'
    : `AUD-KPI-COMMITMENT-${suffix.toUpperCase()}-20260521-001`
  const traceId = input.sourceKpiId === 'customer-huadong'
    ? 'TRACE-KPI-COMMITMENT-HUADONG-20260521'
    : `TRACE-KPI-COMMITMENT-${suffix.toUpperCase()}-20260521`
  const statusLabel = input.statusLabel.includes('风险') || input.statusLabel.includes('延期')
    ? '带外部约束承诺'
    : '待客户确认'
  const commitment = `${input.targetName} 交付恢复口径：Agent OTD ${input.agentOtd}%（基线 ${input.baselineOtd}%），提升 +${input.lift}%，延期减少 ${input.delayedReduced} 单。`
  const actions = [
    {
      module: '客户交付',
      owner: '客户成功 / 售前顾问',
      action: `向 ${input.targetName} 输出 ${input.agentOtd}% OTD 恢复承诺和延期减少 ${input.delayedReduced} 单口径`,
      evidence: traceId,
    },
    {
      module: 'AI 排产',
      owner: '调度员 李工',
      action: input.nextActions[1] ?? '复核 Agent 推荐排产窗口并固化采纳原因',
      evidence: input.sourceTraceId,
    },
    {
      module: '采购 / 工程 / 质量',
      owner: '跨部门责任人',
      action: input.nextActions.filter(Boolean).join('；'),
      evidence: auditId,
    },
  ]
  const record: OtdKpiCommitmentPackage = {
    id: `otd-kpi-commitment-${input.sourceKpiId}`,
    sourceKpiId: input.sourceKpiId,
    dimensionLabel: input.dimensionLabel,
    targetName: input.targetName,
    title: `${input.targetName} 交付恢复承诺包`,
    auditId,
    traceId,
    actor: input.actor,
    baselineOtd: input.baselineOtd,
    agentOtd: input.agentOtd,
    lift: input.lift,
    delayedReduced: input.delayedReduced,
    statusLabel,
    commitment,
    owner: '客户成功 / 调度主管联合确认',
    dueAt: '今日 17:30 前',
    summary: `${input.driver} 已从 KPI 钻取解释转为客户可复盘承诺包，保留 ${input.sourceTraceId} 作为原始 KPI 证据。`,
    actions,
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawPackages().filter(item => item.id !== record.id)].slice(0, MAX_RECORDS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  void upsertOtdKpiCommitment(record).catch(() => undefined)

  upsertOtdEvidenceChainRecord({
    id: `otd-kpi-commitment-${input.sourceKpiId}`,
    stage: '客户承诺包',
    title: record.title,
    summary: `${record.commitment} ${record.summary}`,
    object: `${record.dimensionLabel} / ${record.targetName}`,
    source: `报表中心 / ${record.actor}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const STORAGE_KEY = 'aimes_outsourcing_commitment_packages'
const MAX_RECORDS = 8

export interface OutsourcingCommitmentAction {
  module: string
  owner: string
  action: string
  evidence: string
}

export interface OutsourcingCommitmentPackage {
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
  actions: OutsourcingCommitmentAction[]
  partnerName: string
  promiseDate: string
  affectedOrders: string
  sourceTraceId: string
  createdAt: string
  receivedAt?: string
  receivedBy?: string
  receiptAuditId?: string
  receiptTraceId?: string
  receiptMessage?: string
  scheduleReleasedAt?: string
  scheduleReleasedBy?: string
  scheduleReleaseAuditId?: string
  scheduleReleaseTraceId?: string
  scheduleReleaseMessage?: string
}

interface WriteOutsourcingCommitmentPackageInput {
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
  partnerName: string
  promiseDate: string
  affectedOrders: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isCommitmentAction(item: Partial<OutsourcingCommitmentAction> | null | undefined): item is OutsourcingCommitmentAction {
  return !!item
    && typeof item.module === 'string'
    && typeof item.owner === 'string'
    && typeof item.action === 'string'
    && typeof item.evidence === 'string'
}

function isCommitmentPackage(item: Partial<OutsourcingCommitmentPackage> | null | undefined): item is OutsourcingCommitmentPackage {
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
    && typeof item.partnerName === 'string'
    && typeof item.promiseDate === 'string'
    && typeof item.affectedOrders === 'string'
    && typeof item.sourceTraceId === 'string'
    && typeof item.createdAt === 'string'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readRawPackages(): OutsourcingCommitmentPackage[] {
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

export function readOutsourcingCommitmentPackages(): OutsourcingCommitmentPackage[] {
  return readRawPackages()
}

export async function readOutsourcingCommitmentPackagesBackendFirst(options?: { failLoud?: boolean }): Promise<OutsourcingCommitmentPackage[]> {
  try {
    const { queryOutsourcingCommitments } = await import('../api/outsourcingEvidence')
    const records = await queryOutsourcingCommitments(MAX_RECORDS, options)
    if (!Array.isArray(records)) {
      throw new Error('后端返回非数组外协承诺审计载荷')
    }
    const backendRecords = records.filter(isCommitmentPackage)
    return backendRecords.length > 0 ? backendRecords : readOutsourcingCommitmentPackages()
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readOutsourcingCommitmentPackages()
  }
}

export function readLatestOutsourcingCommitmentPackage(): OutsourcingCommitmentPackage | null {
  return readRawPackages()[0] ?? null
}

export async function readLatestOutsourcingCommitmentPackageBackendFirst(options?: { failLoud?: boolean }): Promise<OutsourcingCommitmentPackage | null> {
  try {
    const { getLatestOutsourcingCommitment } = await import('../api/outsourcingEvidence')
    const record = await getLatestOutsourcingCommitment(options)
    return isCommitmentPackage(record) ? record : readLatestOutsourcingCommitmentPackage()
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return readLatestOutsourcingCommitmentPackage()
  }
}

function upsertOutsourcingCommitmentBackend(record: OutsourcingCommitmentPackage) {
  void import('../api/outsourcingEvidence')
    .then(({ upsertOutsourcingCommitment }) => upsertOutsourcingCommitment(record))
    .catch(() => undefined)
}

export function writeOutsourcingCommitmentPackage(input: WriteOutsourcingCommitmentPackageInput): OutsourcingCommitmentPackage {
  const createdAt = new Date().toISOString()
  const suffix = slugify(input.sourceKpiId) || 'outsourcing'
  const auditId = input.sourceKpiId === 'product-flange'
    ? 'AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001'
    : `AUD-OUTSOURCING-COMMITMENT-${suffix.toUpperCase()}-20260521-001`
  const traceId = input.sourceKpiId === 'product-flange'
    ? 'TRACE-OUTSOURCING-FLANGE-20260521'
    : `TRACE-OUTSOURCING-${suffix.toUpperCase()}-20260521`
  const statusLabel = input.statusLabel.includes('外协') ? input.statusLabel : '外协承诺待到货'
  const commitment = `${input.targetName} 外协承诺口径：${input.partnerName} 将按 ${input.promiseDate} 交付，当前仍保留厂内延期口径。`
  const actions = [
    {
      module: '外协协同',
      owner: '采购 / 计划',
      action: `向 ${input.partnerName} 锁定 ${input.targetName} 的外协承诺日期 ${input.promiseDate}`,
      evidence: traceId,
    },
    {
      module: 'AI 排产',
      owner: '调度员 李工',
      action: input.nextActions[1] ?? '复核外协窗口并保留厂内延期口径',
      evidence: input.sourceTraceId,
    },
    {
      module: '经营复盘',
      owner: '报表中心 / 审计',
      action: '保留外部约束，不把外协承诺误计为厂内已恢复',
      evidence: auditId,
    },
  ]
  const record: OutsourcingCommitmentPackage = {
    id: `outsourcing-commitment-${input.sourceKpiId}`,
    sourceKpiId: input.sourceKpiId,
    dimensionLabel: input.dimensionLabel,
    targetName: input.targetName,
    title: `${input.targetName} 外协承诺包`,
    auditId,
    traceId,
    actor: input.actor,
    baselineOtd: input.baselineOtd,
    agentOtd: input.agentOtd,
    lift: input.lift,
    delayedReduced: input.delayedReduced,
    statusLabel,
    commitment,
    owner: '采购 / 计划联合确认',
    dueAt: input.promiseDate,
    summary: `${input.driver} 已从 KPI 钻取解释转为外协承诺口径，保留 ${input.sourceTraceId} 作为原始 KPI 证据。`,
    actions,
    partnerName: input.partnerName,
    promiseDate: input.promiseDate,
    affectedOrders: input.affectedOrders,
    sourceTraceId: input.sourceTraceId,
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawPackages().filter(item => item.id !== record.id)].slice(0, MAX_RECORDS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  upsertOutsourcingCommitmentBackend(record)

  upsertOtdEvidenceChainRecord({
    id: `outsourcing-commitment-${input.sourceKpiId}`,
    stage: '外协承诺',
    title: record.title,
    summary: `${record.commitment} ${record.summary}`,
    object: `${record.dimensionLabel} / ${record.targetName}`,
    source: `报表中心 / 采购协同 / ${record.actor}`,
    traceId: record.traceId,
    sourceTraceId: record.sourceTraceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

export function confirmOutsourcingCommitmentArrival(sourceKpiId: string, actor: string): OutsourcingCommitmentPackage | null {
  if (!canUseStorage()) return null

  const current = readRawPackages().find(item => item.sourceKpiId === sourceKpiId)
  if (!current) return null

  const suffix = slugify(current.sourceKpiId) || 'outsourcing'
  const receivedAt = new Date().toISOString()
  const receiptAuditId = current.sourceKpiId === 'product-flange'
    ? 'AUD-OUTSOURCING-RECEIPT-FLANGE-20260521-001'
    : `AUD-OUTSOURCING-RECEIPT-${suffix.toUpperCase()}-20260521-001`
  const receiptTraceId = current.sourceKpiId === 'product-flange'
    ? 'TRACE-OUTSOURCING-FLANGE-RECEIVED-20260521'
    : `TRACE-OUTSOURCING-${suffix.toUpperCase()}-RECEIVED-20260521`
  const receiptMessage = `${current.partnerName} 已按 ${current.promiseDate} 完成 ${current.targetName} 外协到货，${current.affectedOrders} 可从厂外等待转为排产释放复核。`
  const updated: OutsourcingCommitmentPackage = {
    ...current,
    statusLabel: '外协到货已确认',
    commitment: `${current.targetName} 外协到货口径：${current.partnerName} 已按 ${current.promiseDate} 到货，厂外等待可关闭但仍需排产释放复核。`,
    summary: `${current.summary} ${receiptMessage}`,
    actions: [
      ...current.actions.filter(action => action.evidence !== receiptTraceId),
      {
        module: '采购协同',
        owner: actor,
        action: `确认 ${current.partnerName} 的 ${current.targetName} 外协到货并触发排产释放复核`,
        evidence: receiptTraceId,
      },
    ],
    receivedAt,
    receivedBy: actor,
    receiptAuditId,
    receiptTraceId,
    receiptMessage,
  }

  const next = [updated, ...readRawPackages().filter(item => item.id !== updated.id)].slice(0, MAX_RECORDS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  upsertOutsourcingCommitmentBackend(updated)

  upsertOtdEvidenceChainRecord({
    id: `outsourcing-receipt-${current.sourceKpiId}`,
    stage: '外协到货',
    title: `${current.targetName} 外协到货已确认`,
    summary: receiptMessage,
    object: `${current.dimensionLabel} / ${current.targetName} / ${current.affectedOrders}`,
    source: `采购协同 / ${current.partnerName} / ${actor}`,
    traceId: receiptTraceId,
    sourceTraceId: current.traceId,
    status: 'closed',
    statusLabel: '外协到货已确认',
    createdAt: receivedAt,
  })

  return updated
}

export function confirmOutsourcingScheduleRelease(sourceKpiId: string, actor: string): OutsourcingCommitmentPackage | null {
  if (!canUseStorage()) return null

  const current = readRawPackages().find(item => item.sourceKpiId === sourceKpiId)
  if (!current || !current.receiptTraceId) return null

  const suffix = slugify(current.sourceKpiId) || 'outsourcing'
  const scheduleReleasedAt = new Date().toISOString()
  const scheduleReleaseAuditId = current.sourceKpiId === 'product-flange'
    ? 'AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001'
    : `AUD-OUTSOURCING-SCHEDULE-RELEASE-${suffix.toUpperCase()}-20260521-001`
  const scheduleReleaseTraceId = current.sourceKpiId === 'product-flange'
    ? 'TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521'
    : `TRACE-OUTSOURCING-${suffix.toUpperCase()}-SCHEDULE-RELEASE-20260521`
  const scheduleReleaseMessage = `${current.targetName} 外协到货已由 AI 排产采纳释放：关闭 ${current.affectedOrders} 的厂外等待口径，按到货后最早可执行窗口恢复排产，并将排产释放结论归档到 OTD 复盘。`
  const updated: OutsourcingCommitmentPackage = {
    ...current,
    statusLabel: '排产释放已确认',
    commitment: `${current.targetName} 外协排产释放口径：${current.partnerName} 到货已确认，${current.affectedOrders} 厂外等待口径已关闭，排产释放结论进入 OTD 复盘。`,
    summary: `${current.summary} ${scheduleReleaseMessage}`,
    actions: [
      ...current.actions.filter(action => action.evidence !== scheduleReleaseTraceId),
      {
        module: 'AI 排产',
        owner: actor,
        action: `关闭 ${current.affectedOrders} 的厂外等待口径并确认排产释放`,
        evidence: scheduleReleaseTraceId,
      },
    ],
    scheduleReleasedAt,
    scheduleReleasedBy: actor,
    scheduleReleaseAuditId,
    scheduleReleaseTraceId,
    scheduleReleaseMessage,
  }

  const next = [updated, ...readRawPackages().filter(item => item.id !== updated.id)].slice(0, MAX_RECORDS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  upsertOutsourcingCommitmentBackend(updated)

  upsertOtdEvidenceChainRecord({
    id: `outsourcing-schedule-release-${current.sourceKpiId}`,
    stage: '外协排产释放',
    title: `${current.targetName} 外协排产释放已确认`,
    summary: scheduleReleaseMessage,
    object: `${current.dimensionLabel} / ${current.targetName} / ${current.affectedOrders}`,
    source: `AI 排产 / ${actor} / ${current.partnerName}`,
    traceId: scheduleReleaseTraceId,
    sourceTraceId: current.receiptTraceId ?? current.traceId,
    status: 'closed',
    statusLabel: '排产释放已确认',
    createdAt: scheduleReleasedAt,
  })

  return updated
}

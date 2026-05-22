import { writeAnomalyDispatchRecord } from './anomaly-dispatch-sync'
import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { writeProductionAnomalyEvent } from './production-anomaly-sync'

const ASSISTANT_ANOMALY_PACKAGE_KEY = 'aimes_assistant_anomaly_packages'
const MAX_PACKAGES = 8

export interface AssistantAnomalyDispatchStep {
  module: string
  owner: string
  action: string
  evidence: string
}

export interface AssistantAnomalyDispositionPackage {
  id: string
  title: string
  auditCode: string
  traceId: string
  actor: string
  role: string
  workOrders: string
  priority: 'critical' | 'warning'
  owner: string
  dueAt: string
  anomalyTitle: string
  operationCode: string
  equipmentId: string
  deliveryImpact: string
  scheduleWindow: string
  statusLabel: string
  summary: string
  dispatchSteps: AssistantAnomalyDispatchStep[]
  createdAt: string
}

interface WriteAssistantAnomalyPackageInput {
  actor: string
  role: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isAssistantAnomalyPackage(item: Partial<AssistantAnomalyDispositionPackage> | null | undefined): item is AssistantAnomalyDispositionPackage {
  return !!item
    && typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.auditCode === 'string'
    && typeof item.traceId === 'string'
    && Array.isArray(item.dispatchSteps)
}

function readRawAssistantAnomalyPackages(): AssistantAnomalyDispositionPackage[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(ASSISTANT_ANOMALY_PACKAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isAssistantAnomalyPackage) : []
  } catch {
    window.localStorage.removeItem(ASSISTANT_ANOMALY_PACKAGE_KEY)
    return []
  }
}

export function readAssistantAnomalyDispositionPackages(): AssistantAnomalyDispositionPackage[] {
  return readRawAssistantAnomalyPackages()
}

export function writeAssistantAnomalyDispositionPackage(input: WriteAssistantAnomalyPackageInput): AssistantAnomalyDispositionPackage {
  const createdAt = new Date().toISOString()
  const record: AssistantAnomalyDispositionPackage = {
    id: 'assistant-anomaly-cnc001-temperature',
    title: 'CNC-001 主轴温升异常处置卡',
    auditCode: 'AUD-CHAT-ANOMALY-20260522-001',
    traceId: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
    actor: input.actor,
    role: input.role,
    workOrders: 'WO-RUSH-9001 / WO-20260501 / WO-2026-0042',
    priority: 'critical',
    owner: '设备主管 赵工',
    dueAt: '今日 14:00',
    anomalyTitle: 'CNC-001 主轴温升异常',
    operationCode: 'OP-020',
    equipmentId: 'CNC-001',
    deliveryImpact: '预计影响 2h 瓶颈设备窗口，WO-RUSH-9001 后段装配存在 1 单延期风险',
    scheduleWindow: '当前 CNC 精加工窗口立即冻结，夜班由 CNC-003 分流复核',
    statusLabel: '助手已创建待分流',
    summary: 'AI 生产助手把聊天中的异常创建意图转成现场异常、风险队列、AI 排产复核和 OTD 证据链可共同读取的处置卡。',
    dispatchSteps: [
      {
        module: '异常管理',
        owner: '班组长 孙八',
        action: '登记 CNC-001 主轴温升异常，要求现场先停机保护并补充冷却系统检查记录',
        evidence: 'TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522',
      },
      {
        module: '风险预警',
        owner: '生产经理审批',
        action: '把受影响工单升级为关键风险，确认 2h 瓶颈设备窗口对交期承诺的影响',
        evidence: 'TRACE-RISK-CHAT-ANOMALY-CNC001-20260522',
      },
      {
        module: 'AI 排产',
        owner: '调度员 李工',
        action: '冻结当前 CNC-001 窗口，生成 CNC-003 分流和夜班加班复核建议',
        evidence: 'TRACE-SCH-CHAT-ANOMALY-CNC001-20260522',
      },
      {
        module: '设备维护',
        owner: '设备主管 赵工',
        action: '确认主轴冷却系统、轴承温升和维护窗口，回写是否允许释放排产',
        evidence: 'TRACE-EQ-CHAT-ANOMALY-CNC001-20260522',
      },
    ],
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawAssistantAnomalyPackages().filter(item => item.id !== record.id)].slice(0, MAX_PACKAGES)
    window.localStorage.setItem(ASSISTANT_ANOMALY_PACKAGE_KEY, JSON.stringify(next))
  }

  writeProductionAnomalyEvent({
    id: 'prod-anomaly-chat-cnc001-temp',
    workOrderNumber: 'WO-RUSH-9001',
    operationCode: record.operationCode,
    operationName: 'CNC 精加工',
    equipmentId: record.equipmentId,
    anomalyType: 'equipment',
    severity: 'Critical',
    title: record.title,
    description: record.deliveryImpact,
    detectedAt: createdAt,
    detectedBy: input.actor,
    suggestedAction: '立即冻结 CNC-001 当前窗口，通知设备主管复核主轴冷却系统，同时让 AI 排产生成 CNC-003 分流和夜班加班建议。',
  })

  upsertOtdEvidenceChainRecord({
    id: `production-anomaly-${record.id}`,
    stage: '生产异常',
    title: `${record.title}已由 AI 助手创建`,
    summary: 'AI 生产助手创建现场异常后，生产报工、异常中心、风险队列和 AI 排产必须围绕同一异常追踪编号冻结窗口、复核设备状态并确认交期影响。',
    object: 'WO-RUSH-9001 / OP-020 / CNC-001',
    source: `AI 生产助手 / ${record.actor}`,
    traceId: 'TRACE-PROD-ANOMALY-CHAT-CNC001-20260522',
    sourceTraceId: record.traceId,
    status: 'active',
    statusLabel: '助手创建待复核',
    createdAt,
  })

  writeAnomalyDispatchRecord({
    id: 'anomaly-dispatch-chat-cnc001-temp',
    anomalyId: 'chat-cnc001-temp',
    type: 'equipment',
    typeLabel: '助手异常处置',
    title: 'AI 助手创建的 CNC-001 主轴温升异常已分流到风险与排产复核',
    workOrderNumber: 'WO-RUSH-9001',
    operationCode: record.operationCode,
    route: 'AI 生产助手 -> 异常管理 -> 风险预警 -> AI 排产 -> 设备维护',
    owner: record.owner,
    dueAt: record.dueAt,
    affectedOrders: record.workOrders,
    deliveryImpact: record.deliveryImpact,
    scheduleWindow: record.scheduleWindow,
    suggestedAction: '先冻结 CNC-001 当前窗口，触发风险升级和 CNC-003 分流复核，设备维护确认后再释放后续工序。',
    auditId: record.auditCode,
    traceId: record.traceId,
    statusLabel: '助手异常已分流',
    summary: record.summary,
    createdAt,
  })

  upsertOtdEvidenceChainRecord({
    id: `assistant-anomaly-${record.id}`,
    stage: '助手异常处置',
    title: record.title,
    summary: `${record.summary} 交期影响：${record.deliveryImpact}；排产窗口：${record.scheduleWindow}。`,
    object: record.workOrders,
    source: `AI 生产助手 / ${record.actor}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

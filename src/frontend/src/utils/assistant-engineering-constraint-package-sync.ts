import {
  readEngineeringChangeImpactAnalysis,
  readRouteCapabilityValidation,
  writeEngineeringChangeImpactAnalysis,
  writeRouteCapabilityValidation,
} from './engineering-change-sync'
import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'

const ASSISTANT_ENGINEERING_CONSTRAINT_PACKAGE_KEY = 'aimes_assistant_engineering_constraint_packages'
const MAX_PACKAGES = 8

export interface AssistantEngineeringConstraintStep {
  module: string
  owner: string
  action: string
  evidence: string
}

export interface AssistantEngineeringConstraintPackage {
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
  bomCode: string
  ecnCode: string
  routeCode: string
  operationCode: string
  otdImpact: string
  statusLabel: string
  summary: string
  dispatchSteps: AssistantEngineeringConstraintStep[]
  createdAt: string
}

interface WriteAssistantEngineeringConstraintPackageInput {
  actor: string
  role: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isAssistantEngineeringConstraintPackage(
  item: Partial<AssistantEngineeringConstraintPackage> | null | undefined,
): item is AssistantEngineeringConstraintPackage {
  return !!item
    && typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.auditCode === 'string'
    && typeof item.traceId === 'string'
    && typeof item.workOrders === 'string'
    && Array.isArray(item.dispatchSteps)
}

function readRawAssistantEngineeringConstraintPackages(): AssistantEngineeringConstraintPackage[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(ASSISTANT_ENGINEERING_CONSTRAINT_PACKAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isAssistantEngineeringConstraintPackage) : []
  } catch {
    window.localStorage.removeItem(ASSISTANT_ENGINEERING_CONSTRAINT_PACKAGE_KEY)
    return []
  }
}

export function readAssistantEngineeringConstraintPackages(): AssistantEngineeringConstraintPackage[] {
  return readRawAssistantEngineeringConstraintPackages()
}

export function writeAssistantEngineeringConstraintPackage(
  input: WriteAssistantEngineeringConstraintPackageInput,
): AssistantEngineeringConstraintPackage {
  const createdAt = new Date().toISOString()
  const engineeringImpact = readEngineeringChangeImpactAnalysis()
    ?? writeEngineeringChangeImpactAnalysis({
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1007',
    })
  const routeCapability = readRouteCapabilityValidation()
    ?? writeRouteCapabilityValidation({
      decision: 'released',
      affectedOrders: 'WO-DEMO-1007 / WO-RUSH-9001 / WO-DEMO-1002',
    })

  const record: AssistantEngineeringConstraintPackage = {
    id: 'assistant-engineering-constraint-a100-rb200',
    title: 'BOM-A100 / R-B200 工程约束复核包',
    auditCode: 'AUD-CHAT-ENG-CONSTRAINT-20260523-001',
    traceId: 'TRACE-CHAT-ENG-CONSTRAINT-PACKAGE-20260523',
    actor: input.actor,
    role: input.role,
    workOrders: 'WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1007',
    priority: 'warning',
    owner: '工程经理 / 制造经理联合复核',
    dueAt: '今日 16:30',
    bomCode: 'BOM-A100',
    ecnCode: 'ECN-BOM-A100-6061B-20260521',
    routeCode: 'R-B200',
    operationCode: 'OP-090',
    otdImpact: '+7% OTD 模拟，减少 1 单延期风险',
    statusLabel: '待工程约束复核',
    summary: 'AI 生产助手把 BOM 替代料、ECN 影响、R-B200 OP-090 热处理能力和质量门要求合并成工程约束复核包，要求工程、工艺、AI 排产和质量共同回写同一追踪编号。',
    dispatchSteps: [
      {
        module: 'BOM 管理',
        owner: '工程经理 / EMP-004',
        action: '复核 BOM-A100 中 M-AL-6061B 替代规则、ECN 影响分析和首件材质追溯要求',
        evidence: engineeringImpact?.traceId ?? 'TRACE-ENG-ECN-BOM-A100-6061B',
      },
      {
        module: '工艺路线',
        owner: '工艺工程师 陈工',
        action: '复核 R-B200 OP-090 热处理能力缺口、HT-02 夜班窗口和外协兜底可用性',
        evidence: routeCapability?.traceId ?? 'TRACE-ROUTE-CAP-R-B200-OP-090',
      },
      {
        module: 'AI 排产',
        owner: '调度员 李工',
        action: '在锁定期后生成替代料释放、热处理合批和质量门保留的排产复核建议',
        evidence: 'TRACE-SCH-ENG-CONSTRAINT-REVIEW-20260523',
      },
      {
        module: '质量门/工程审批',
        owner: '质量工程师 周工',
        action: '确认替代料首件材质复核、OP-040 扭矩检验和 ECN 审批前模拟边界',
        evidence: 'TRACE-QA-ENG-CONSTRAINT-GATE-20260523',
      },
    ],
    createdAt,
  }

  if (canUseStorage()) {
    const next = [record, ...readRawAssistantEngineeringConstraintPackages().filter(item => item.id !== record.id)]
      .slice(0, MAX_PACKAGES)
    window.localStorage.setItem(ASSISTANT_ENGINEERING_CONSTRAINT_PACKAGE_KEY, JSON.stringify(next))
  }

  upsertOtdEvidenceChainRecord({
    id: `assistant-engineering-constraint-${record.id}`,
    stage: '助手工程约束',
    title: record.title,
    summary: `${record.summary} 影响工单：${record.workOrders}；OTD 影响：${record.otdImpact}。`,
    object: `${record.bomCode} / ${record.ecnCode} / ${record.routeCode} ${record.operationCode}`,
    source: `AI 生产助手 / ${record.actor}`,
    traceId: record.traceId,
    status: 'active',
    statusLabel: record.statusLabel,
    createdAt,
  })

  return record
}

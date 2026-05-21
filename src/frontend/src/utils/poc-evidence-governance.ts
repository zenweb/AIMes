import { readCustomerOrderImportEvidence, type CustomerOrderImportEvidence } from './customer-order-import-sync'
import { readCustomerEquipmentFaultEvidence, type CustomerEquipmentFaultEvidence } from './equipment-risk-sync'

export interface PocEvidenceGovernanceRecord {
  id: string
  scope: string
  title: string
  description: string
  batchId: string
  fileName: string
  source: string
  requiredRole: string
  owner: string
  auditId: string
  status: string
  statusClass: 'logged' | 'accepted' | 'guarded'
  preparedAt: string
  object: string
  evidence: string
  risk: string
  auditState: string
  steps: string[]
}

export function readPocEvidenceGovernanceRecords(): PocEvidenceGovernanceRecord[] {
  const records: PocEvidenceGovernanceRecord[] = []
  const orderImport = readCustomerOrderImportEvidence()
  const equipmentFault = readCustomerEquipmentFaultEvidence()

  if (orderImport) records.push(mapCustomerOrderImport(orderImport))
  if (equipmentFault) records.push(mapCustomerEquipmentFault(equipmentFault))

  return records
}

function mapCustomerOrderImport(evidence: CustomerOrderImportEvidence): PocEvidenceGovernanceRecord {
  const auditId = `AUD-POC-WO-${evidence.batchId.split('-').slice(-1)[0]}`
  return {
    id: 'poc-customer-order-import',
    scope: 'POC 证据',
    title: '客户工单导入样例治理',
    description: `${evidence.importedOrders} 单客户工单样例已完成字段映射，${evidence.highRiskOrders} 单高风险进入排产与风险验证。`,
    batchId: evidence.batchId,
    fileName: evidence.fileName,
    source: evidence.source,
    requiredRole: 'Engineer / Admin',
    owner: '客户 IT / 实施顾问',
    auditId,
    status: '已归档',
    statusClass: 'logged',
    preparedAt: evidence.preparedAt,
    object: `${evidence.importedOrders} 单客户工单 / ${evidence.highRiskOrders} 单高风险`,
    evidence: evidence.mappedFields.join(' / '),
    risk: '客户字段已进入 POC 验收口径，后续导入必须保留字段映射和批次留痕。',
    auditState: '客户工单导入样例、字段映射、风险识别和报表回写已归档',
    steps: [
      `${evidence.source} 提供 ${evidence.fileName}。`,
      `系统按 ${evidence.mappedFields.join('、')} 完成字段映射。`,
      `${evidence.highRiskOrders} 单高风险工单进入风险与排产验证。`,
      `报表中心执行回写维度补满，批次 ${evidence.batchId} 写入 POC 证据包。`,
    ],
  }
}

function mapCustomerEquipmentFault(evidence: CustomerEquipmentFaultEvidence): PocEvidenceGovernanceRecord {
  const auditId = `AUD-POC-EQ-${evidence.batchId.split('-').slice(-1)[0]}`
  return {
    id: 'poc-customer-equipment-fault',
    scope: 'POC 证据',
    title: '客户设备故障样例治理',
    description: `${evidence.equipmentCode} ${evidence.downtimeHours}h 停机样例已完成信号映射，并同步到 AI 排产事件队列。`,
    batchId: evidence.batchId,
    fileName: evidence.fileName,
    source: evidence.source,
    requiredRole: 'Engineer / Admin',
    owner: '设备维护 / 实施顾问',
    auditId,
    status: '事件联动',
    statusClass: 'accepted',
    preparedAt: evidence.preparedAt,
    object: `${evidence.equipmentCode} / ${evidence.affectedOrders}`,
    evidence: evidence.capturedSignals.join(' / '),
    risk: '设备故障样例已影响事件闭环评分，后续真实接入必须保留信号来源、影响工单和停机窗口。',
    auditState: '客户设备故障样例、停机事件、排产影响和 POC 评分回写已归档',
    steps: [
      `${evidence.source} 提供 ${evidence.fileName}。`,
      `系统采集 ${evidence.capturedSignals.join('、')} 并映射到 ${evidence.equipmentCode}。`,
      `${evidence.downtimeHours}h 停机窗口影响 ${evidence.affectedOrders}，同步进入 AI 排产事件队列。`,
      `报表中心事件闭环维度补满，批次 ${evidence.batchId} 写入 POC 证据包。`,
    ],
  }
}

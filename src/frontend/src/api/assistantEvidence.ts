import http from './http'
import type { AssistantActionAuditRecord } from '../utils/assistant-action-audit'
import type { AssistantRecoveryPackage } from '../utils/assistant-action-package-sync'
import type { AssistantAnomalyDispositionPackage } from '../utils/assistant-anomaly-card-sync'
import type { AssistantEngineeringConstraintPackage } from '../utils/assistant-engineering-constraint-package-sync'

export async function queryAssistantActionAudits(take = 12, options?: { failLoud?: boolean }): Promise<AssistantActionAuditRecord[]> {
  try {
    const { data } = await http.get<AssistantActionAuditRecord[]>('/scheduling/assistant-action-audits', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertAssistantActionAudit(item: AssistantActionAuditRecord): Promise<AssistantActionAuditRecord> {
  const { data } = await http.post<AssistantActionAuditRecord>('/scheduling/assistant-action-audits', item)
  return data
}

export async function queryAssistantRecoveryPackages(take = 8, options?: { failLoud?: boolean }): Promise<AssistantRecoveryPackage[]> {
  try {
    const { data } = await http.get<AssistantRecoveryPackage[]>('/scheduling/assistant-recovery-packages', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertAssistantRecoveryPackage(item: AssistantRecoveryPackage): Promise<AssistantRecoveryPackage> {
  const { data } = await http.post<AssistantRecoveryPackage>('/scheduling/assistant-recovery-packages', item)
  return data
}

export async function queryAssistantAnomalyPackages(take = 8, options?: { failLoud?: boolean }): Promise<AssistantAnomalyDispositionPackage[]> {
  try {
    const { data } = await http.get<AssistantAnomalyDispositionPackage[]>('/scheduling/assistant-anomaly-packages', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertAssistantAnomalyPackage(item: AssistantAnomalyDispositionPackage): Promise<AssistantAnomalyDispositionPackage> {
  const { data } = await http.post<AssistantAnomalyDispositionPackage>('/scheduling/assistant-anomaly-packages', item)
  return data
}

export async function queryAssistantEngineeringConstraintPackages(take = 8, options?: { failLoud?: boolean }): Promise<AssistantEngineeringConstraintPackage[]> {
  try {
    const { data } = await http.get<AssistantEngineeringConstraintPackage[]>('/scheduling/assistant-engineering-constraint-packages', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertAssistantEngineeringConstraintPackage(item: AssistantEngineeringConstraintPackage): Promise<AssistantEngineeringConstraintPackage> {
  const { data } = await http.post<AssistantEngineeringConstraintPackage>('/scheduling/assistant-engineering-constraint-packages', item)
  return data
}

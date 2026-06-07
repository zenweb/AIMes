import http from './http'
import type { AnomalyDispatchRecord } from '../utils/anomaly-dispatch-sync'
import type { MonitoringSituationEscalation } from '../utils/monitoring-situation-escalation-sync'
import type { ProductionAnomalyEvent } from '../utils/production-anomaly-sync'
import type { RiskActionTrace } from '../utils/risk-action-sync'
import type { RiskSlaReviewRecord } from '../utils/risk-sla-review-sync'

export async function getLatestProductionAnomalyEvent(): Promise<ProductionAnomalyEvent | null> {
  try {
    const { data } = await http.get<ProductionAnomalyEvent>('/scheduling/production-anomaly-event/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertProductionAnomalyEvent(item: ProductionAnomalyEvent): Promise<ProductionAnomalyEvent> {
  const { data } = await http.post<ProductionAnomalyEvent>('/scheduling/production-anomaly-event', item)
  return data
}

export async function queryAnomalyDispatchRecords(take = 12): Promise<AnomalyDispatchRecord[]> {
  try {
    const { data } = await http.get<AnomalyDispatchRecord[]>('/scheduling/anomaly-dispatch-records', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function upsertAnomalyDispatchRecord(item: AnomalyDispatchRecord): Promise<AnomalyDispatchRecord> {
  const { data } = await http.post<AnomalyDispatchRecord>('/scheduling/anomaly-dispatch-records', item)
  return data
}

export async function queryMonitoringSituationEscalations(take = 8, options?: { failLoud?: boolean }): Promise<MonitoringSituationEscalation[]> {
  try {
    const { data } = await http.get<MonitoringSituationEscalation[]>('/scheduling/monitoring-situation-escalations', { params: { take } })
    return data
  } catch (error) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertMonitoringSituationEscalation(item: MonitoringSituationEscalation): Promise<MonitoringSituationEscalation> {
  const { data } = await http.post<MonitoringSituationEscalation>('/scheduling/monitoring-situation-escalations', item)
  return data
}

export async function getLatestRiskSlaReview(): Promise<RiskSlaReviewRecord | null> {
  try {
    const { data } = await http.get<RiskSlaReviewRecord>('/scheduling/risk-sla-review/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertRiskSlaReview(item: RiskSlaReviewRecord): Promise<RiskSlaReviewRecord> {
  const { data } = await http.post<RiskSlaReviewRecord>('/scheduling/risk-sla-review', item)
  return data
}

export async function queryRiskActionTraces(take = 12): Promise<RiskActionTrace[]> {
  try {
    const { data } = await http.get<RiskActionTrace[]>('/scheduling/risk-action-traces', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function upsertRiskActionTrace(item: RiskActionTrace): Promise<RiskActionTrace> {
  const { data } = await http.post<RiskActionTrace>('/scheduling/risk-action-traces', item)
  return data
}

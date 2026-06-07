import http from './http'
import type { CustomerOrderImportEvidence } from '../utils/customer-order-import-sync'
import type { PocHypercareAcceptanceRecord } from '../utils/poc-hypercare-sync'
import type { PocPilotRunRecord } from '../utils/poc-pilot-run-sync'
import type { PocReviewSignoffRecord } from '../utils/poc-review-signoff-sync'
import type { PocRolloutPackageRecord } from '../utils/poc-rollout-package-sync'

export async function getLatestCustomerOrderImport(): Promise<CustomerOrderImportEvidence | null> {
  const { data } = await http.get<CustomerOrderImportEvidence>('/scheduling/customer-order-import/latest')
  return data
}

export async function upsertCustomerOrderImport(item: CustomerOrderImportEvidence): Promise<CustomerOrderImportEvidence> {
  const { data } = await http.post<CustomerOrderImportEvidence>('/scheduling/customer-order-import', item)
  return data
}

export async function getLatestPocReviewSignoff(): Promise<PocReviewSignoffRecord | null> {
  try {
    const { data } = await http.get<PocReviewSignoffRecord>('/scheduling/poc-review-signoff/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertPocReviewSignoff(item: PocReviewSignoffRecord): Promise<PocReviewSignoffRecord> {
  const { data } = await http.post<PocReviewSignoffRecord>('/scheduling/poc-review-signoff', item)
  return data
}

export async function getLatestPocRolloutPackage(): Promise<PocRolloutPackageRecord | null> {
  try {
    const { data } = await http.get<PocRolloutPackageRecord>('/scheduling/poc-rollout-package/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertPocRolloutPackage(item: PocRolloutPackageRecord): Promise<PocRolloutPackageRecord> {
  const { data } = await http.post<PocRolloutPackageRecord>('/scheduling/poc-rollout-package', item)
  return data
}

export async function getLatestPocPilotRun(): Promise<PocPilotRunRecord | null> {
  try {
    const { data } = await http.get<PocPilotRunRecord>('/scheduling/poc-pilot-run/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertPocPilotRun(item: PocPilotRunRecord): Promise<PocPilotRunRecord> {
  const { data } = await http.post<PocPilotRunRecord>('/scheduling/poc-pilot-run', item)
  return data
}

export async function getLatestPocHypercareAcceptance(options?: { failLoud?: boolean }): Promise<PocHypercareAcceptanceRecord | null> {
  try {
    const { data } = await http.get<PocHypercareAcceptanceRecord>('/scheduling/poc-hypercare-acceptance/latest')
    return data
  } catch (error) {
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertPocHypercareAcceptance(item: PocHypercareAcceptanceRecord): Promise<PocHypercareAcceptanceRecord> {
  const { data } = await http.post<PocHypercareAcceptanceRecord>('/scheduling/poc-hypercare-acceptance', item)
  return data
}

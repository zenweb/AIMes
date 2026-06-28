import http, { type AimesRequestConfig } from './http'
import type { CustomerOrderImportEvidence } from '../utils/customer-order-import-sync'
import type { PocHypercareAcceptanceRecord } from '../utils/poc-hypercare-sync'
import type { PocPilotRunRecord } from '../utils/poc-pilot-run-sync'
import type { PocReviewSignoffRecord } from '../utils/poc-review-signoff-sync'
import type { PocRolloutPackageRecord } from '../utils/poc-rollout-package-sync'

export async function getLatestCustomerOrderImport(options?: { failLoud?: boolean }): Promise<CustomerOrderImportEvidence | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<CustomerOrderImportEvidence>('/scheduling/customer-order-import/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    throw error
  }
}

export async function upsertCustomerOrderImport(item: CustomerOrderImportEvidence): Promise<CustomerOrderImportEvidence> {
  const { data } = await http.post<CustomerOrderImportEvidence>('/scheduling/customer-order-import', item)
  return data
}

export async function getLatestPocReviewSignoff(): Promise<PocReviewSignoffRecord | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<PocReviewSignoffRecord>('/scheduling/poc-review-signoff/latest', config)
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
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<PocRolloutPackageRecord>('/scheduling/poc-rollout-package/latest', config)
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
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<PocPilotRunRecord>('/scheduling/poc-pilot-run/latest', config)
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
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<PocHypercareAcceptanceRecord>('/scheduling/poc-hypercare-acceptance/latest', config)
    return data
  } catch (error) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertPocHypercareAcceptance(item: PocHypercareAcceptanceRecord): Promise<PocHypercareAcceptanceRecord> {
  const { data } = await http.post<PocHypercareAcceptanceRecord>('/scheduling/poc-hypercare-acceptance', item)
  return data
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}

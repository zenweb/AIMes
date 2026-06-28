import http, { type AimesRequestConfig } from './http'
import type {
  BomKittingPackage,
  ShortageKittingEvent,
  ShortageRiskResolution,
  SupplierNetworkDecision,
  SupplyRiskEscalation,
} from '../utils/shortage-risk-sync'

export async function getLatestShortageKitting(options?: { failLoud?: boolean }): Promise<ShortageKittingEvent | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<ShortageKittingEvent>('/scheduling/shortage-kitting/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertShortageKitting(item: ShortageKittingEvent): Promise<ShortageKittingEvent> {
  const { data } = await http.post<ShortageKittingEvent>('/scheduling/shortage-kitting', item)
  return data
}

export async function getLatestShortageRiskResolution(options?: { failLoud?: boolean }): Promise<ShortageRiskResolution | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<ShortageRiskResolution>('/scheduling/shortage-risk-resolution/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertShortageRiskResolution(item: ShortageRiskResolution): Promise<ShortageRiskResolution> {
  const { data } = await http.post<ShortageRiskResolution>('/scheduling/shortage-risk-resolution', item)
  return data
}

export async function getLatestBomKittingPackage(options?: { failLoud?: boolean }): Promise<BomKittingPackage | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<BomKittingPackage>('/scheduling/bom-kitting-package/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertBomKittingPackage(item: BomKittingPackage): Promise<BomKittingPackage> {
  const { data } = await http.post<BomKittingPackage>('/scheduling/bom-kitting-package', item)
  return data
}

export async function getLatestSupplyRiskEscalation(options?: { failLoud?: boolean }): Promise<SupplyRiskEscalation | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<SupplyRiskEscalation>('/scheduling/supply-risk-escalation/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertSupplyRiskEscalation(item: SupplyRiskEscalation): Promise<SupplyRiskEscalation> {
  const { data } = await http.post<SupplyRiskEscalation>('/scheduling/supply-risk-escalation', item)
  return data
}

export async function getLatestSupplierNetworkDecision(options?: { failLoud?: boolean }): Promise<SupplierNetworkDecision | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<SupplierNetworkDecision>('/scheduling/supplier-network-decision/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertSupplierNetworkDecision(item: SupplierNetworkDecision): Promise<SupplierNetworkDecision> {
  const { data } = await http.post<SupplierNetworkDecision>('/scheduling/supplier-network-decision', item)
  return data
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}

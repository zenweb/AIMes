import http from './http'
import type {
  BomKittingPackage,
  ShortageKittingEvent,
  ShortageRiskResolution,
  SupplierNetworkDecision,
  SupplyRiskEscalation,
} from '../utils/shortage-risk-sync'

export async function getLatestShortageKitting(): Promise<ShortageKittingEvent | null> {
  try {
    const { data } = await http.get<ShortageKittingEvent>('/scheduling/shortage-kitting/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertShortageKitting(item: ShortageKittingEvent): Promise<ShortageKittingEvent> {
  const { data } = await http.post<ShortageKittingEvent>('/scheduling/shortage-kitting', item)
  return data
}

export async function getLatestShortageRiskResolution(): Promise<ShortageRiskResolution | null> {
  try {
    const { data } = await http.get<ShortageRiskResolution>('/scheduling/shortage-risk-resolution/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertShortageRiskResolution(item: ShortageRiskResolution): Promise<ShortageRiskResolution> {
  const { data } = await http.post<ShortageRiskResolution>('/scheduling/shortage-risk-resolution', item)
  return data
}

export async function getLatestBomKittingPackage(): Promise<BomKittingPackage | null> {
  try {
    const { data } = await http.get<BomKittingPackage>('/scheduling/bom-kitting-package/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertBomKittingPackage(item: BomKittingPackage): Promise<BomKittingPackage> {
  const { data } = await http.post<BomKittingPackage>('/scheduling/bom-kitting-package', item)
  return data
}

export async function getLatestSupplyRiskEscalation(): Promise<SupplyRiskEscalation | null> {
  try {
    const { data } = await http.get<SupplyRiskEscalation>('/scheduling/supply-risk-escalation/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertSupplyRiskEscalation(item: SupplyRiskEscalation): Promise<SupplyRiskEscalation> {
  const { data } = await http.post<SupplyRiskEscalation>('/scheduling/supply-risk-escalation', item)
  return data
}

export async function getLatestSupplierNetworkDecision(): Promise<SupplierNetworkDecision | null> {
  try {
    const { data } = await http.get<SupplierNetworkDecision>('/scheduling/supplier-network-decision/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertSupplierNetworkDecision(item: SupplierNetworkDecision): Promise<SupplierNetworkDecision> {
  const { data } = await http.post<SupplierNetworkDecision>('/scheduling/supplier-network-decision', item)
  return data
}

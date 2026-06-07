import http from './http'
import type {
  AlternateMaterialApproval,
  EngineeringChangeImpactAnalysis,
  RouteCapabilityValidation,
} from '../utils/engineering-change-sync'

export async function getLatestAlternateMaterialApproval(): Promise<AlternateMaterialApproval | null> {
  try {
    const { data } = await http.get<AlternateMaterialApproval>('/scheduling/alternate-material-approval/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertAlternateMaterialApproval(item: AlternateMaterialApproval): Promise<AlternateMaterialApproval> {
  const { data } = await http.post<AlternateMaterialApproval>('/scheduling/alternate-material-approval', item)
  return data
}

export async function getLatestEngineeringChangeImpact(): Promise<EngineeringChangeImpactAnalysis | null> {
  try {
    const { data } = await http.get<EngineeringChangeImpactAnalysis>('/scheduling/engineering-change-impact/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertEngineeringChangeImpact(item: EngineeringChangeImpactAnalysis): Promise<EngineeringChangeImpactAnalysis> {
  const { data } = await http.post<EngineeringChangeImpactAnalysis>('/scheduling/engineering-change-impact', item)
  return data
}

export async function getLatestRouteCapabilityValidation(options?: { failLoud?: boolean }): Promise<RouteCapabilityValidation | null> {
  try {
    const { data } = await http.get<RouteCapabilityValidation>('/scheduling/route-capability-validation/latest')
    return data
  } catch (error) {
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertRouteCapabilityValidation(item: RouteCapabilityValidation): Promise<RouteCapabilityValidation> {
  const { data } = await http.post<RouteCapabilityValidation>('/scheduling/route-capability-validation', item)
  return data
}

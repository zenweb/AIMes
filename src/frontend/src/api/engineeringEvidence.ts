import http, { type AimesRequestConfig } from './http'
import type {
  AlternateMaterialApproval,
  EngineeringChangeImpactAnalysis,
  RouteCapabilityValidation,
} from '../utils/engineering-change-sync'

interface EngineeringEvidenceReadOptions {
  failLoud?: boolean
}

export async function getLatestAlternateMaterialApproval(options?: EngineeringEvidenceReadOptions): Promise<AlternateMaterialApproval | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<AlternateMaterialApproval>('/scheduling/alternate-material-approval/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertAlternateMaterialApproval(item: AlternateMaterialApproval): Promise<AlternateMaterialApproval> {
  const { data } = await http.post<AlternateMaterialApproval>('/scheduling/alternate-material-approval', item)
  return data
}

export async function getLatestEngineeringChangeImpact(options?: EngineeringEvidenceReadOptions): Promise<EngineeringChangeImpactAnalysis | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<EngineeringChangeImpactAnalysis>('/scheduling/engineering-change-impact/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertEngineeringChangeImpact(item: EngineeringChangeImpactAnalysis): Promise<EngineeringChangeImpactAnalysis> {
  const { data } = await http.post<EngineeringChangeImpactAnalysis>('/scheduling/engineering-change-impact', item)
  return data
}

export async function getLatestRouteCapabilityValidation(options?: EngineeringEvidenceReadOptions): Promise<RouteCapabilityValidation | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<RouteCapabilityValidation>('/scheduling/route-capability-validation/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertRouteCapabilityValidation(item: RouteCapabilityValidation): Promise<RouteCapabilityValidation> {
  const { data } = await http.post<RouteCapabilityValidation>('/scheduling/route-capability-validation', item)
  return data
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}

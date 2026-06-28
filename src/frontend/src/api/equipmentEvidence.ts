import http, { type AimesRequestConfig } from './http'
import type { CustomerEquipmentFaultEvidence, EquipmentDowntimeEvent } from '../utils/equipment-risk-sync'

export async function getLatestEquipmentDowntime(options?: { failLoud?: boolean }): Promise<EquipmentDowntimeEvent | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<EquipmentDowntimeEvent>('/scheduling/equipment-downtime/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertEquipmentDowntime(item: EquipmentDowntimeEvent): Promise<EquipmentDowntimeEvent> {
  const { data } = await http.post<EquipmentDowntimeEvent>('/scheduling/equipment-downtime', item)
  return data
}

export async function getLatestCustomerEquipmentFault(options?: { failLoud?: boolean }): Promise<CustomerEquipmentFaultEvidence | null> {
  try {
    const config: AimesRequestConfig = { suppressErrorToast: true }
    const { data } = await http.get<CustomerEquipmentFaultEvidence>('/scheduling/customer-equipment-fault/latest', config)
    return data
  } catch (error: unknown) {
    if (isNotFoundResponse(error)) return null
    if (options?.failLoud) throw error
    return null
  }
}

export async function upsertCustomerEquipmentFault(item: CustomerEquipmentFaultEvidence): Promise<CustomerEquipmentFaultEvidence> {
  const { data } = await http.post<CustomerEquipmentFaultEvidence>('/scheduling/customer-equipment-fault', item)
  return data
}

function isNotFoundResponse(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as { response?: { status?: unknown } }
  return candidate.response?.status === 404
}

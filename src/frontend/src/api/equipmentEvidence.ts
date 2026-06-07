import http from './http'
import type { CustomerEquipmentFaultEvidence, EquipmentDowntimeEvent } from '../utils/equipment-risk-sync'

export async function getLatestEquipmentDowntime(): Promise<EquipmentDowntimeEvent | null> {
  try {
    const { data } = await http.get<EquipmentDowntimeEvent>('/scheduling/equipment-downtime/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertEquipmentDowntime(item: EquipmentDowntimeEvent): Promise<EquipmentDowntimeEvent> {
  const { data } = await http.post<EquipmentDowntimeEvent>('/scheduling/equipment-downtime', item)
  return data
}

export async function getLatestCustomerEquipmentFault(): Promise<CustomerEquipmentFaultEvidence | null> {
  try {
    const { data } = await http.get<CustomerEquipmentFaultEvidence>('/scheduling/customer-equipment-fault/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertCustomerEquipmentFault(item: CustomerEquipmentFaultEvidence): Promise<CustomerEquipmentFaultEvidence> {
  const { data } = await http.post<CustomerEquipmentFaultEvidence>('/scheduling/customer-equipment-fault', item)
  return data
}

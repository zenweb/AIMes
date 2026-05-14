export interface DashboardData {
  kpi: KpiCard
  equipment: EquipmentStatus[]
  todaySchedule: TodaySchedule[]
  materialAlerts: MaterialAlert[]
  qualityStats: QualityStats
}

export interface KpiCard {
  scheduleAdherence: number
  qualityPassRate: number
  equipmentUtilization: number
  activeOrders: number
}

export interface EquipmentStatus {
  id: string
  name: string
  type: string
  status: string
  statusText: string
}

export interface TodaySchedule {
  id: string
  time: string
  name: string
  equip: string
  status: string
  statusText: string
}

export interface MaterialAlert {
  code: string
  name: string
  level: string
  available: number
  min: number
}

export interface QualityStats {
  totalInspections: number
  passed: number
  defects: number
  pendingAnomalies: number
  passRate: number
}

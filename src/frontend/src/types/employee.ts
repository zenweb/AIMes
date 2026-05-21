export interface Employee {
  id: string
  employeeNumber: string
  name: string
  phone: string | null
  email: string | null
  role: string
  team: string | null
  shift: string | null
  skills?: string[]
  certifications?: EmployeeCertification[]
  availability?: EmployeeAvailability
  isActive: boolean
  createdAt: string
}

export type EmployeeAvailabilityStatus = 'available' | 'leave' | 'overtime' | 'on_call'

export interface EmployeeAvailability {
  date: string
  status: EmployeeAvailabilityStatus
  statusLabel: string
  window: string
  capacityHours: number
  source: string
}

export interface EmployeeCertification {
  name: string
  expiresAt: string
  status: 'valid' | 'expiring' | 'expired'
}

export interface CreateEmployeeRequest {
  employeeNumber: string
  name: string
  phone?: string
  email?: string
  role: string
  team?: string
  shift?: string
}

export interface UpdateEmployeeRequest {
  name?: string
  phone?: string
  email?: string
  role?: string
  team?: string
  shift?: string
  isActive?: boolean
}

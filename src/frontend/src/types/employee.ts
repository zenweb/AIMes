export interface Employee {
  id: string
  employeeNumber: string
  name: string
  phone: string | null
  email: string | null
  role: string
  team: string | null
  shift: string | null
  isActive: boolean
  createdAt: string
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

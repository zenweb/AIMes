import http from './http'
import type { PagedResult } from '../types/common'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee'

export async function getEmployeeList(page = 1, pageSize = 20): Promise<PagedResult<Employee>> {
  const { data } = await http.get<PagedResult<Employee>>('/employee', { params: { page, pageSize } })
  return data
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const { data } = await http.get<Employee>(`/employee/${id}`)
  return data
}

export async function getEmployeesByTeam(team: string): Promise<Employee[]> {
  const { data } = await http.get<Employee[]>(`/employee/team/${team}`)
  return data
}

export async function createEmployee(req: CreateEmployeeRequest): Promise<Employee> {
  const { data } = await http.post<Employee>('/employee', req)
  return data
}

export async function updateEmployee(id: string, req: UpdateEmployeeRequest): Promise<Employee> {
  const { data } = await http.put<Employee>(`/employee/${id}`, req)
  return data
}

export async function deactivateEmployee(id: string): Promise<void> {
  await http.post(`/employee/${id}/deactivate`)
}

import axios from 'axios'
import type { SystemUser, SystemConfig, CreateUserRequest, UpdateUserRequest, UpdateConfigRequest, NotificationConfig, UpdateNotificationConfigRequest } from '../types/admin'

const http = axios.create({ baseURL: '/api/v1', timeout: 30000 })

export async function getUsers(): Promise<SystemUser[]> {
  const { data } = await http.get<SystemUser[]>('/admin/users')
  return data
}

export async function createUser(req: CreateUserRequest): Promise<SystemUser> {
  const { data } = await http.post<SystemUser>('/admin/users', req)
  return data
}

export async function updateUser(id: string, req: UpdateUserRequest): Promise<SystemUser> {
  const { data } = await http.put<SystemUser>(`/admin/users/${id}`, req)
  return data
}

export async function getConfigs(): Promise<SystemConfig[]> {
  const { data } = await http.get<SystemConfig[]>('/admin/configs')
  return data
}

export async function updateConfig(id: string, req: UpdateConfigRequest): Promise<SystemConfig> {
  const { data } = await http.put<SystemConfig>(`/admin/configs/${id}`, req)
  return data
}

export async function getNotificationConfigs(): Promise<NotificationConfig[]> {
  const { data } = await http.get<NotificationConfig[]>('/admin/notifications')
  return data
}

export async function updateNotificationConfig(id: string, req: UpdateNotificationConfigRequest): Promise<NotificationConfig> {
  const { data } = await http.put<NotificationConfig>(`/admin/notifications/${id}`, req)
  return data
}

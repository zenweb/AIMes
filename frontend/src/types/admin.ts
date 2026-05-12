export interface SystemUser {
  id: string
  username: string
  displayName: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface SystemConfig {
  id: string
  configKey: string
  configValue: string
  description: string | null
  category: string | null
  updatedAt: string
  updatedBy: string | null
}

export interface CreateUserRequest {
  username: string
  displayName: string
  role: string
}

export interface UpdateUserRequest {
  displayName?: string
  role?: string
  isActive?: boolean
}

export interface UpdateConfigRequest {
  configValue: string
  updatedBy?: string
}

export interface NotificationConfig {
  id: string
  category: string
  label: string
  enabled: boolean
  description: string | null
}

export interface UpdateNotificationConfigRequest {
  enabled: boolean
}

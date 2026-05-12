import { ref, type Ref } from 'vue'
import * as signalR from '@microsoft/signalr'

export interface Toast {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
}

const toasts = ref<Toast[]>([])
let connection: signalR.HubConnection | null = null
const connected = ref(false)

export function addToast(type: Toast['type'], title: string, message: string) {
  const toast: Toast = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    message,
    timestamp: new Date(),
  }
  toasts.value.push(toast)

  // 3秒后自动移除
  setTimeout(() => {
    const idx = toasts.value.indexOf(toast)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }, 3000)

  // 最多保留 5 条
  if (toasts.value.length > 5) {
    toasts.value.shift()
  }
}

export function useNotifications() {
  function connect() {
    if (connection?.state === signalR.HubConnectionState.Connected) return

    connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications')
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('EquipmentStatusChanged', (data: any) => {
      addToast(
        data.status === 'fault' ? 'error' : 'info',
        '设备状态变更',
        `${data.equipmentName} → ${statusLabel(data.status)}`
      )
    })

    connection.on('QualityAlert', (data: any) => {
      addToast(
        data.severity === 'critical' ? 'error' : 'warning',
        '质量预警',
        `${data.productName}: ${severityLabel(data.severity)}`
      )
    })

    connection.on('AnomalyAlert', (data: any) => {
      addToast(
        data.severity === 'critical' ? 'error' : 'warning',
        `异常告警 [${severityLabel(data.severity)}]`,
        data.description
      )
    })

    connection.on('ProductionProgress', (data: any) => {
      addToast('info', `工单 ${data.orderNumber}`, `进度更新: ${data.progress}%`)
    })

    connection.on('InventoryChanged', (data: any) => {
      const labels: Record<string, string> = { StockIn: '入库', StockOut: '出库', Transfer: '调拨', Adjustment: '调整' }
      addToast('info', `库存变更 [${labels[data.transactionType] || data.transactionType}]`, `${data.materialName}(${data.materialCode}) 数量: ${data.quantity}`)
    })

    connection.on('PurchaseOrderStatusChanged', (data: any) => {
      addToast('success', `采购单 ${data.orderNumber}`, `状态更新: ${data.status}`)
    })

    connection.onreconnecting(() => { connected.value = false })
    connection.onreconnected(() => { connected.value = true })
    connection.onclose(() => { connected.value = false })

    connection.start().then(() => { connected.value = true }).catch(() => {})
  }

  function disconnect() {
    connection?.stop()
    connected.value = false
  }

  return { toasts, connected, connect, disconnect, addToast }
}

function statusLabel(s: string) {
  const map: Record<string, string> = { running: '运行中', idle: '空闲', maintenance: '维护中', fault: '故障', offline: '离线' }
  return map[s] || s
}

function severityLabel(s: string) {
  const map: Record<string, string> = { critical: '紧急', major: '严重', minor: '一般', warning: '需关注' }
  return map[s] || s
}

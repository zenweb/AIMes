import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { getLocalAccessToken } from '../utils/auth-token'
import { appAssetPath, isOfflineDemoMode } from '../utils/offline-demo-mode'

export interface Toast {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
}

// SignalR event payload types
interface EquipmentStatusEvent {
  equipmentId: string
  equipmentName: string
  status: string
  previousStatus?: string
  timestamp: string
}

interface QualityAlertEvent {
  inspectionId: string
  productCode: string
  productName: string
  severity: string
  defectType?: string
  defectQuantity?: number
}

interface AnomalyAlertEvent {
  workOrderId: string
  severity: string
  description: string
  timestamp?: string
}

interface ProductionProgressEvent {
  workOrderId: string
  orderNumber: string
  productCode: string
  progress: number
  completedQuantity: number
  plannedQuantity: number
}

interface InventoryChangedEvent {
  materialId: string
  materialCode: string
  materialName: string
  transactionType: string
  quantity: number
  newStock: number
}

interface PurchaseOrderStatusEvent {
  orderId: string
  orderNumber: string
  status: string
  previousStatus?: string
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
    if (isOfflineDemoMode()) {
      connected.value = false
      return
    }

    if (connection?.state === signalR.HubConnectionState.Connected) return

    connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => getLocalAccessToken() ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('EquipmentStatusChanged', (data: EquipmentStatusEvent) => {
      addToast(
        data.status === 'fault' ? 'error' : 'info',
        '设备状态变更',
        `${data.equipmentName} → ${statusLabel(data.status)}`
      )
    })

    connection.on('QualityAlert', (data: QualityAlertEvent) => {
      const type = data.severity === 'critical' ? 'error' : 'warning'
      addToast(type, '质量预警', `${data.productName}: ${severityLabel(data.severity)}`)
      if (data.severity === 'critical') {
        playAlertSound()
        sendBrowserNotification('质量预警', `${data.productName}: ${severityLabel(data.severity)}`)
      }
    })

    connection.on('AnomalyAlert', (data: AnomalyAlertEvent) => {
      const type = data.severity === 'critical' ? 'error' : 'warning'
      addToast(type, `异常告警 [${severityLabel(data.severity)}]`, data.description)
      if (data.severity === 'critical' || data.severity === 'high') {
        playAlertSound()
        sendBrowserNotification(`异常告警 [${severityLabel(data.severity)}]`, data.description)
      }
    })

    connection.on('ProductionProgress', (data: ProductionProgressEvent) => {
      addToast('info', `工单 ${data.orderNumber}`, `进度更新: ${data.progress}%`)
    })

    connection.on('InventoryChanged', (data: InventoryChangedEvent) => {
      const labels: Record<string, string> = { StockIn: '入库', StockOut: '出库', Transfer: '调拨', Adjustment: '调整' }
      addToast('info', `库存变更 [${labels[data.transactionType] || data.transactionType}]`, `${data.materialName}(${data.materialCode}) 数量: ${data.quantity}`)
    })

    connection.on('PurchaseOrderStatusChanged', (data: PurchaseOrderStatusEvent) => {
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

function playAlertSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // 浏览器可能阻止自动播放
  }
}

function sendBrowserNotification(title: string, body: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: appAssetPath('favicon.ico') })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification(title, { body, icon: appAssetPath('favicon.ico') })
      }
    })
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = { running: '运行中', idle: '空闲', maintenance: '维护中', fault: '故障', offline: '离线' }
  return map[s] || s
}

function severityLabel(s: string) {
  const map: Record<string, string> = { critical: '紧急', major: '严重', minor: '一般', warning: '需关注' }
  return map[s] || s
}

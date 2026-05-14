export interface InventoryItem {
  id: string
  materialCode: string
  materialName: string
  materialType: string
  unit: string
  availableQuantity: number
  reservedQuantity: number
  realQuantity: number
  safetyStock: number
  storageLocation: string
  expiryDate: string | null
  createdAt: string
}

export interface StockTransaction {
  id: string
  materialCode: string
  materialName: string
  transactionType: string
  quantity: number
  balanceBefore: number
  balanceAfter: number
  referenceType: string | null
  referenceNumber: string | null
  warehouse: string | null
  operator: string | null
  remark: string | null
  createdAt: string
}

export interface InventoryDashboard {
  totalMaterials: number
  lowStockCount: number
  outOfStockCount: number
  todayTransactions: number
}

export interface StockInRequest {
  materialCode: string
  quantity: number
  warehouse?: string
  location?: string
  referenceType?: string
  referenceNumber?: string
  operator?: string
  remark?: string
}

export interface StockOutRequest {
  materialCode: string
  quantity: number
  referenceType?: string
  referenceNumber?: string
  operator?: string
  remark?: string
}

export interface TransferRequest {
  materialCode: string
  quantity: number
  fromWarehouse: string
  toWarehouse: string
  operator?: string
  remark?: string
}

export interface AdjustmentRequest {
  materialCode: string
  newQuantity: number
  operator?: string
  remark?: string
}

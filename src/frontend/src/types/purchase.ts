export interface PurchaseOrderSummary {
  id: string
  orderNumber: string
  supplierName: string
  status: string
  orderDate: string
  expectedDeliveryDate: string | null
  totalAmount: number
  itemCount: number
  createdBy: string
  createdAt: string
}

export interface PurchaseOrderLineItem {
  id: string
  materialCode: string
  materialName: string
  unit: string
  quantity: number
  receivedQuantity: number
  unitPrice: number
  totalPrice: number
  expectedDate: string | null
  remark: string | null
}

export interface PurchaseOrderDetail {
  id: string
  orderNumber: string
  supplierName: string
  supplierContact: string | null
  status: string
  orderDate: string
  expectedDeliveryDate: string | null
  completedDate: string | null
  totalAmount: number
  remark: string | null
  createdBy: string
  createdAt: string
  updatedAt: string | null
  items: PurchaseOrderLineItem[]
}

export interface CreatePurchaseOrderRequest {
  orderNumber: string
  supplierName: string
  supplierContact?: string
  expectedDeliveryDate?: string
  remark?: string
  createdBy: string
  items: CreatePurchaseLineRequest[]
}

export interface CreatePurchaseLineRequest {
  materialCode: string
  materialName: string
  unit: string
  quantity: number
  unitPrice: number
  expectedDate?: string
  remark?: string
}

export interface ReceiveRequest {
  materialCode: string
  quantity: number
}

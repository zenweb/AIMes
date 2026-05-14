export interface BomSummary {
  id: string
  bomCode: string
  bomName: string
  productCode: string
  productName: string
  bomType: string
  version: string
  status: string
  effectiveDate: string | null
  expireDate: string | null
  itemCount: number
  createdAt: string
}

export interface BomDetail {
  id: string
  bomCode: string
  bomName: string
  productCode: string
  productName: string
  bomType: string
  version: string
  status: string
  effectiveDate: string | null
  expireDate: string | null
  items: BomItem[]
  changeHistory: BomChangeRecord[]
  createdAt: string
  updatedAt: string | null
}

export interface BomItem {
  id: string
  materialCode: string
  materialName: string
  quantity: number
  unit: string
  lossRate: number | null
  leadTimeDays: number | null
  consumptionTiming: string
  sequence: number
  children: BomItem[]
}

export interface BomChangeRecord {
  changeDescription: string
  changedBy: string
  changedAt: string
}

export interface BomExplosionResult {
  bomId: string
  bomName: string
  productCode: string
  productName: string
  items: BomExplosionItem[]
}

export interface BomExplosionItem {
  materialCode: string
  materialName: string
  quantityPerUnit: number
  totalQuantity: number
  unit: string
  lossRate: number | null
  leadTimeDays: number | null
  consumptionTiming: string
  level: number
  children: BomExplosionItem[]
}

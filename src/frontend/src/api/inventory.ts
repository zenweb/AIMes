import http from './http'
import type { InventoryItem, StockTransaction, InventoryDashboard, StockInRequest, StockOutRequest, TransferRequest, AdjustmentRequest } from '../types/inventory'

export async function getInventoryDashboard(): Promise<InventoryDashboard> {
  const { data } = await http.get<InventoryDashboard>('/inventory/dashboard')
  return data
}

export async function getInventoryList(): Promise<InventoryItem[]> {
  const { data } = await http.get<InventoryItem[]>('/inventory')
  return data
}

export async function getInventoryByCode(materialCode: string): Promise<InventoryItem> {
  const { data } = await http.get<InventoryItem>(`/inventory/${materialCode}`)
  return data
}

export async function getStockTransactions(materialCode?: string, page = 1, pageSize = 20): Promise<StockTransaction[]> {
  const params: any = { page, pageSize }
  if (materialCode) params.materialCode = materialCode
  const { data } = await http.get<StockTransaction[]>('/inventory/transactions', { params })
  return data
}

export async function stockIn(request: StockInRequest): Promise<StockTransaction> {
  const { data } = await http.post<StockTransaction>('/inventory/stock-in', request)
  return data
}

export async function stockOut(request: StockOutRequest): Promise<StockTransaction> {
  const { data } = await http.post<StockTransaction>('/inventory/stock-out', request)
  return data
}

export async function transferStock(request: TransferRequest): Promise<StockTransaction> {
  const { data } = await http.post<StockTransaction>('/inventory/transfer', request)
  return data
}

export async function adjustStock(request: AdjustmentRequest): Promise<StockTransaction> {
  const { data } = await http.post<StockTransaction>('/inventory/adjust', request)
  return data
}

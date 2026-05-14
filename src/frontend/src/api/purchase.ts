import http from './http'
import type { PagedResult } from '../types/common'
import type { PurchaseOrderSummary, PurchaseOrderDetail, CreatePurchaseOrderRequest, ReceiveRequest } from '../types/purchase'

export async function getPurchaseList(page = 1, pageSize = 20): Promise<PagedResult<PurchaseOrderSummary>> {
  const { data } = await http.get<PagedResult<PurchaseOrderSummary>>('/purchase', { params: { page, pageSize } })
  return data
}

export async function getPurchaseById(id: string): Promise<PurchaseOrderDetail> {
  const { data } = await http.get<PurchaseOrderDetail>(`/purchase/${id}`)
  return data
}

export async function createPurchaseOrder(req: CreatePurchaseOrderRequest): Promise<PurchaseOrderDetail> {
  const { data } = await http.post<PurchaseOrderDetail>('/purchase', req)
  return data
}

export async function submitPurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
  const { data } = await http.post<PurchaseOrderDetail>(`/purchase/${id}/submit`)
  return data
}

export async function confirmPurchaseOrder(id: string): Promise<PurchaseOrderDetail> {
  const { data } = await http.post<PurchaseOrderDetail>(`/purchase/${id}/confirm`)
  return data
}

export async function receivePurchaseOrder(id: string, req: ReceiveRequest): Promise<PurchaseOrderDetail> {
  const { data } = await http.post<PurchaseOrderDetail>(`/purchase/${id}/receive`, req)
  return data
}

export async function cancelPurchaseOrder(id: string): Promise<void> {
  await http.post(`/purchase/${id}/cancel`)
}

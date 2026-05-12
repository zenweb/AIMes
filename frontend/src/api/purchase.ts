import axios from 'axios'
import type { PurchaseOrderSummary, PurchaseOrderDetail, CreatePurchaseOrderRequest, ReceiveRequest } from '../types/purchase'

const http = axios.create({ baseURL: '/api/v1', timeout: 30000 })

export async function getPurchaseList(): Promise<PurchaseOrderSummary[]> {
  const { data } = await http.get<PurchaseOrderSummary[]>('/purchase')
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

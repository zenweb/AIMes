import http from './http'
import type { PagedResult } from '../types/common'
import type { BomSummary, BomDetail, BomExplosionResult } from '../types/bom'

const BASE = '/bom'

export async function getBomList(page = 1, pageSize = 20): Promise<PagedResult<BomSummary>> {
  const { data } = await http.get<PagedResult<BomSummary>>(BASE, { params: { page, pageSize } })
  return data
}

export async function getBomById(id: string): Promise<BomDetail> {
  const { data } = await http.get(`${BASE}/${id}`)
  return data
}

export async function explodeBom(id: string, quantity = 1): Promise<BomExplosionResult> {
  const { data } = await http.get(`${BASE}/${id}/explode`, { params: { quantity } })
  return data
}

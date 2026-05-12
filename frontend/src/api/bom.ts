import axios from 'axios'
import type { BomSummary, BomDetail, BomExplosionResult } from '../types/bom'

const BASE = '/api/v1/bom'

export async function getBomList(): Promise<BomSummary[]> {
  const { data } = await axios.get(BASE)
  return data
}

export async function getBomById(id: string): Promise<BomDetail> {
  const { data } = await axios.get(`${BASE}/${id}`)
  return data
}

export async function explodeBom(id: string, quantity = 1): Promise<BomExplosionResult> {
  const { data } = await axios.get(`${BASE}/${id}/explode`, { params: { quantity } })
  return data
}

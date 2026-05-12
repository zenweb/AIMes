import axios from 'axios'
import type { ProcessRoute, RouteDetail } from '../types/routing'

const BASE = '/api/v1/routing'

export async function getRouteList(): Promise<ProcessRoute[]> {
  const { data } = await axios.get(BASE)
  return data
}

export async function getRouteById(id: string): Promise<RouteDetail> {
  const { data } = await axios.get(`${BASE}/${id}`)
  return data
}

export async function getRouteByCode(code: string): Promise<RouteDetail> {
  const { data } = await axios.get(`${BASE}/by-code/${code}`)
  return data
}

import http from './http'
import type { PagedResult } from '../types/common'
import type { ProcessRoute, RouteDetail } from '../types/routing'

const BASE = '/routing'

export async function getRouteList(page = 1, pageSize = 20): Promise<PagedResult<ProcessRoute>> {
  const { data } = await http.get<PagedResult<ProcessRoute>>(BASE, { params: { page, pageSize } })
  return data
}

export async function getRouteById(id: string): Promise<RouteDetail> {
  const { data } = await http.get(`${BASE}/${id}`)
  return data
}

export async function getRouteByCode(code: string): Promise<RouteDetail> {
  const { data } = await http.get(`${BASE}/by-code/${code}`)
  return data
}

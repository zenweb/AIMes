import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyzeAnomaly, getAnomalyById, getAnomalyList, getCriticalAnomalies } from '../../src/api/anomaly'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('anomaly api route prefixes', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
    httpGet.mockResolvedValue({ data: {} })
    httpPost.mockResolvedValue({ data: {} })
  })

  it('uses http baseURL-relative anomaly paths without duplicating api/v1', async () => {
    await getAnomalyList(2, 10)
    await getCriticalAnomalies()
    await getAnomalyById('AN-001')
    await analyzeAnomaly('AN-001')

    expect(httpGet).toHaveBeenNthCalledWith(1, '/anomaly', { params: { page: 2, pageSize: 10 } })
    expect(httpGet).toHaveBeenNthCalledWith(2, '/anomaly/critical')
    expect(httpGet).toHaveBeenNthCalledWith(3, '/anomaly/AN-001')
    expect(httpPost).toHaveBeenCalledWith('/anomaly/AN-001/analyze')
    const requestedPaths = [
      ...httpGet.mock.calls.map(call => call[0]),
      ...httpPost.mock.calls.map(call => call[0]),
    ]
    expect(requestedPaths).not.toContain('/api/v1/anomaly')
    expect(requestedPaths.every(path => !String(path).includes('/api/v1/api/v1/'))).toBe(true)
  })

  it('uses stable default paging for anomaly list reads', async () => {
    const result = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 }
    httpGet.mockResolvedValueOnce({ data: result })

    await expect(getAnomalyList()).resolves.toBe(result)

    expect(httpGet).toHaveBeenCalledWith('/anomaly', { params: { page: 1, pageSize: 20 } })
  })

  it('returns backend data for critical anomaly and detail reads', async () => {
    const critical = [{ id: 'AN-CRITICAL-001', severity: 'Critical' }]
    const detail = {
      id: 'AN-001',
      title: 'CNC-001 主轴温升异常',
      responses: [],
    }
    httpGet
      .mockResolvedValueOnce({ data: critical })
      .mockResolvedValueOnce({ data: detail })

    await expect(getCriticalAnomalies()).resolves.toBe(critical)
    await expect(getAnomalyById('AN-001')).resolves.toBe(detail)

    expect(httpGet).toHaveBeenNthCalledWith(1, '/anomaly/critical')
    expect(httpGet).toHaveBeenNthCalledWith(2, '/anomaly/AN-001')
  })

  it('returns backend analysis results without reshaping AI suggestions', async () => {
    const analysis = {
      anomalyId: 'AN-001',
      title: 'CNC-001 主轴温升异常',
      suggestedRootCause: '冷却液循环不足',
      suggestedResolution: '停机检查主轴冷却系统',
      analysisSummary: '建议立即停机并保护后续排产承诺。',
      suggestedActions: [
        {
          action: '停机检查冷却液循环',
          reason: '冷却不足可能导致主轴温升',
          priority: 1,
        },
      ],
    }
    httpPost.mockResolvedValueOnce({ data: analysis })

    await expect(analyzeAnomaly('AN-001')).resolves.toBe(analysis)

    expect(httpPost).toHaveBeenCalledWith('/anomaly/AN-001/analyze')
  })

  it('does not hide backend failures from anomaly callers', async () => {
    httpGet.mockRejectedValueOnce(new Error('anomaly backend unavailable'))
    httpPost.mockRejectedValueOnce(new Error('anomaly analysis unavailable'))

    await expect(getAnomalyList()).rejects.toThrow('anomaly backend unavailable')
    await expect(analyzeAnomaly('AN-001')).rejects.toThrow('anomaly analysis unavailable')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { completeOperation, getWorkOrders, reportException, scanOperation, startOperation } from '../../src/api/production'
import { installMemoryLocalStorage } from './test-storage'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('production api', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    httpGet.mockResolvedValue({ data: {} })
    httpPost.mockResolvedValue({ data: {} })
  })

  it('returns deterministic local operation results so production demo evidence can continue without a backend', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')

    await expect(startOperation('OP-DEMO', {
      operatorId: 'operator1',
      stationId: 'ST-001',
      equipmentId: 'CNC-002',
    })).resolves.toEqual({
      operationId: 'OP-DEMO',
      status: 'in_progress',
      message: '离线演示开工已确认',
    })

    await expect(completeOperation('OP-DEMO', {
      quantity: 12,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })).resolves.toEqual({
      operationId: 'OP-DEMO',
      status: 'completed',
      message: '离线演示完工已确认',
    })

    await expect(reportException('OP-DEMO', {
      reason: '主轴振动异常',
    })).resolves.toEqual({
      operationId: 'OP-DEMO',
      status: 'exception',
      message: '离线演示异常已上报',
    })
  })

  it('uses backend contract paths for work orders and shop-floor operation commands', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [], totalCount: 0 } })
    httpPost
      .mockResolvedValueOnce({ data: { operationId: 'OP-001', operationName: 'CNC 精加工' } })
      .mockResolvedValueOnce({ data: { operationId: 'OP-001', status: 'in_progress' } })
      .mockResolvedValueOnce({ data: { operationId: 'OP-001', status: 'completed' } })
      .mockResolvedValueOnce({ data: { operationId: 'OP-001', status: 'exception' } })

    await getWorkOrders({ status: 'in_progress', workshopId: 'WS-01', page: 2, pageSize: 20 })
    await scanOperation('WO-001-OP10', 'operator1')
    await startOperation('OP-001', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })
    await completeOperation('OP-001', {
      quantity: 10,
      defectQuantity: 1,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    await reportException('OP-001', {
      reason: '刀具寿命预警',
    })

    expect(httpGet).toHaveBeenCalledWith('/scheduling/workorders', {
      params: { status: 'in_progress', workshopId: 'WS-01', page: 2, pageSize: 20 },
    })
    expect(httpPost).toHaveBeenNthCalledWith(1, '/production/scan', {
      code: 'WO-001-OP10',
      operatorId: 'operator1',
    })
    expect(httpPost).toHaveBeenNthCalledWith(2, '/production/operations/OP-001/start', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })
    expect(httpPost).toHaveBeenNthCalledWith(3, '/production/operations/OP-001/complete', {
      quantity: 10,
      defectQuantity: 1,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    expect(httpPost).toHaveBeenNthCalledWith(4, '/production/operations/OP-001/exception', {
      reason: '刀具寿命预警',
    })
  })

  it('keeps scan payloads exact so barcode handoff evidence is not silently reshaped', async () => {
    httpPost.mockResolvedValueOnce({
      data: {
        operationId: 'OP-BARCODE',
        operationName: '总装扫码',
        workOrderNumber: 'WO-20260614',
      },
    })

    const result = await scanOperation('  WO-20260614-OP20  ')

    expect(result).toEqual({
      operationId: 'OP-BARCODE',
      operationName: '总装扫码',
      workOrderNumber: 'WO-20260614',
    })
    expect(httpPost).toHaveBeenCalledWith('/production/scan', {
      code: '  WO-20260614-OP20  ',
      operatorId: undefined,
    })
  })

  it('does not call backend command endpoints in offline demo mode', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')

    await startOperation('OP-OFFLINE', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })
    await completeOperation('OP-OFFLINE', {
      quantity: 3,
      defectQuantity: 0,
      inspectionResult: 'Pass',
      reportedBy: 'operator1',
    })
    await reportException('OP-OFFLINE', {
      reason: '离线异常演练',
    })

    expect(httpPost).not.toHaveBeenCalled()
  })

  it('uses backend command endpoints when stale offline demo storage coexists with a real token', async () => {
    localStorage.setItem('aimes_offline_demo', 'true')
    localStorage.setItem('aimes_token', 'backend-access-token')
    httpPost.mockResolvedValueOnce({ data: { operationId: 'OP-LIVE', status: 'in_progress' } })

    await expect(startOperation('OP-LIVE', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })).resolves.toEqual({ operationId: 'OP-LIVE', status: 'in_progress' })

    expect(httpPost).toHaveBeenCalledWith('/production/operations/OP-LIVE/start', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })
  })

  it('propagates backend command failures so production operators see a real fail-loud state', async () => {
    const backendError = new Error('MES API unavailable')
    httpPost.mockRejectedValueOnce(backendError)

    await expect(startOperation('OP-FAIL', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })).rejects.toThrow('MES API unavailable')

    expect(httpPost).toHaveBeenCalledWith('/production/operations/OP-FAIL/start', {
      operatorId: 'operator1',
      stationId: 'ST-01',
      equipmentId: 'EQ-01',
    })
  })
})

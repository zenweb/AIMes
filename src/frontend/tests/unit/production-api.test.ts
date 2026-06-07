import { beforeEach, describe, expect, it } from 'vitest'
import { completeOperation, reportException, startOperation } from '../../src/api/production'
import { installMemoryLocalStorage } from './test-storage'

describe('production api offline demo mode', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
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
})

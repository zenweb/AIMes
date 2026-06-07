import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readProductionAnomalyEvent,
  readProductionAnomalyEventBackendFirst,
  toProductionAnomaly,
  toProductionAnomalyDetail,
  type ProductionAnomalyEvent,
  writeProductionAnomalyEvent,
} from '../../src/utils/production-anomaly-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function anomalyEvent(overrides: Partial<ProductionAnomalyEvent> = {}): ProductionAnomalyEvent {
  return {
    id: 'PA-001',
    workOrderNumber: 'WO-2026-0042',
    operationCode: 'OP-20',
    operationName: 'CNC 精加工',
    equipmentId: 'CNC-001',
    anomalyType: 'Equipment',
    severity: 'High',
    title: 'CNC-001 主轴温升异常',
    description: '主轴温升超过阈值，需切换设备并复核排产窗口。',
    detectedAt: '2026-05-31T08:00:00.000Z',
    detectedBy: 'operator-01',
    suggestedAction: '分流到 CNC-003，并安排夜班维护窗口。',
    ...overrides,
  }
}

describe('production anomaly sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('persists the latest production anomaly and syncs backend best-effort', async () => {
    const event = anomalyEvent()

    writeProductionAnomalyEvent(event)
    await vi.dynamicImportSettled()

    expect(readProductionAnomalyEvent()).toEqual(event)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/production-anomaly-event', event)
  })

  it('falls back to the local anomaly event when backend returns no record', async () => {
    const localEvent = anomalyEvent()
    writeProductionAnomalyEvent(localEvent)
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readProductionAnomalyEventBackendFirst()).resolves.toEqual(localEvent)
    expect(httpGet).toHaveBeenCalledWith('/scheduling/production-anomaly-event/latest')
  })

  it('maps production anomaly events into list and detail view contracts', () => {
    const event = anomalyEvent({ equipmentId: null })

    expect(toProductionAnomaly(event)).toEqual(expect.objectContaining({
      id: 'PA-001',
      workOrderNumber: 'WO-2026-0042',
      operationCode: 'OP-20',
      equipmentId: null,
      status: 'Open',
      responseCount: 1,
    }))
    expect(toProductionAnomalyDetail(event)).toEqual(expect.objectContaining({
      responses: [
        expect.objectContaining({
          id: 'PA-001-ai-response',
          responseType: 'AiSuggestion',
          suggestedAction: '分流到 CNC-003，并安排夜班维护窗口。',
          status: 'Pending',
          createdAt: '2026-05-31T08:00:00.000Z',
        }),
      ],
    }))
  })

  it('removes corrupt anomaly JSON so production boards do not render stale events', () => {
    localStorage.setItem('aimes_production_anomaly_event', '{bad json')

    expect(readProductionAnomalyEvent()).toBeNull()
    expect(localStorage.getItem('aimes_production_anomaly_event')).toBeNull()
  })

  it('removes incomplete anomaly events that cannot explain operation or suggested action', () => {
    localStorage.setItem('aimes_production_anomaly_event', JSON.stringify({
      id: 'PA-001',
      workOrderNumber: 'WO-2026-0042',
      title: 'CNC-001 主轴温升异常',
    }))

    expect(readProductionAnomalyEvent()).toBeNull()
    expect(localStorage.getItem('aimes_production_anomaly_event')).toBeNull()
  })
})

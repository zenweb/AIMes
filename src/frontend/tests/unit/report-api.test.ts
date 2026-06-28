import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getReportDashboard } from '../../src/api/report'

const httpGet = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
  },
}))

describe('report api', () => {
  beforeEach(() => {
    httpGet.mockReset()
  })

  it('reads the report dashboard from the report endpoint without duplicating api/v1', async () => {
    const dashboard = {
      production: {
        totalWorkOrders: 48,
        completedOrders: 32,
        inProgressOrders: 12,
        onTimeRate: 0.85,
        dailyOutput: [{ label: '5/1', value: 20 }],
      },
      quality: {
        passRate: 0.976,
        defectRate: 0.024,
        totalInspections: 1250,
        defectCount: 30,
        dailyDefects: [{ label: '5/1', value: 2 }],
      },
      equipment: {
        totalEquipment: 24,
        runningCount: 18,
        utilizationRate: 0.78,
        availabilityRate: 0.94,
        utilizationTrend: [{ label: '第1周', value: 72 }],
      },
      anomaly: {
        totalAnomalies: 36,
        openCount: 5,
        resolvedCount: 28,
        avgResolveHours: 3.5,
        anomalyByType: [{ label: '设备', value: 14 }],
      },
      otdImprovement: {
        baselineOtd: 0.4,
        agentOtd: 0.5667,
        otdLift: 0.1667,
        baselineDelayedOrders: 18,
        agentDelayedOrders: 13,
        delayedOrdersReduced: 5,
        changeoverMinutesReduced: 260,
        protectedRushOrders: 2,
        decisionTraceCount: 3,
        demoDatasetSize: 30,
        headline: 'AI 排产提升准交率',
        reasons: [],
        demoPath: [],
        sampleOrders: [],
      },
    }
    httpGet.mockResolvedValueOnce({ data: dashboard })

    await expect(getReportDashboard()).resolves.toBe(dashboard)

    expect(httpGet).toHaveBeenCalledWith('/report/dashboard')
    expect(httpGet.mock.calls[0][0]).not.toContain('/api/v1')
  })

  it('does not hide dashboard backend failures from ReportBoard fallback handling', async () => {
    httpGet.mockRejectedValueOnce(new Error('report dashboard backend unavailable'))

    await expect(getReportDashboard()).rejects.toThrow('report dashboard backend unavailable')
    expect(httpGet).toHaveBeenCalledWith('/report/dashboard')
  })
})

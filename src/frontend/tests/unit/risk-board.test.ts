import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RiskBoard from '../../src/components/risk/RiskBoard.vue'

const getRiskDashboard = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/risk', () => ({
  getRiskDashboard,
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  isOfflineDemoError: vi.fn(() => false),
  logUnlessOfflineDemo: vi.fn(),
}))

function mountRiskBoard() {
  return mount(RiskBoard, {
    global: {
      stubs: {
        RiskActionQueuePanel: true,
      },
    },
  })
}

describe('RiskBoard', () => {
  beforeEach(() => {
    getRiskDashboard.mockRejectedValue(new Error('risk api unavailable'))
  })

  it('announces dashboard load failures while falling back to demo risk data', async () => {
    const wrapper = mountRiskBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('加载失败: risk api unavailable')
    expect(alert.text()).toContain('已加载演示数据')
    expect(wrapper.text()).toContain('WO-2026-0042')
  })
})

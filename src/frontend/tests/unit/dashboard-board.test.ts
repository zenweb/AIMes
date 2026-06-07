import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardBoard from '../../src/components/dashboard/DashboardBoard.vue'

const getDashboard = vi.hoisted(() => vi.fn())
const readShortageRiskResolutionBackendFirst = vi.hoisted(() => vi.fn())
const readOtdEvidenceChainRecords = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/dashboard', () => ({
  getDashboard,
}))

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(),
  LogLevel: { Warning: 2 },
}))

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readShortageRiskResolutionBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords,
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecordBackendFirst,
}))

vi.mock('../../src/utils/auth-token', () => ({
  getLocalAccessToken: vi.fn(() => 'token'),
}))

vi.mock('../../src/utils/offline-demo-mode', () => ({
  appAssetPath: (path: string) => path,
  isOfflineDemoMode: vi.fn(() => true),
}))

function mountDashboardBoard() {
  return mount(DashboardBoard, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>',
        },
      },
    },
  })
}

describe('DashboardBoard', () => {
  beforeEach(() => {
    getDashboard.mockRejectedValue(new Error('offline'))
    readShortageRiskResolutionBackendFirst.mockResolvedValue(null)
    readOtdEvidenceChainRecords.mockReturnValue([])
    upsertOtdEvidenceChainRecord.mockReturnValue([])
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      json: async () => null,
    })))
  })

  it('exposes the command center journey as an ordered navigation list', async () => {
    const wrapper = mountDashboardBoard()
    await flushPromises()

    const list = wrapper.get('[aria-label="AI MES 指挥中心主线"]')
    expect(list.element.tagName).toBe('OL')
    const steps = list.findAll('li')
    expect(steps).toHaveLength(5)
    expect(steps.map(step => step.find('strong').text())).toEqual([
      '风险识别',
      'Agent 重排',
      '采购协同',
      '生产执行',
      'OTD 复盘',
    ])
  })

  it('shows a fail-loud message when demo rehearsal evidence cannot be written', async () => {
    upsertOtdEvidenceChainRecord.mockImplementation(() => {
      throw new Error('dashboard evidence storage unavailable')
    })

    const wrapper = mountDashboardBoard()
    await flushPromises()

    await wrapper.get('.runbook-rehearsal button').trigger('click')
    await flushPromises()

    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('彩排证据写入失败')
    expect(wrapper.text()).toContain('5 分钟 Demo 彩排尚未写入 OTD 证据链')
    expect(wrapper.text()).toContain('dashboard evidence storage unavailable')
    expect(wrapper.text()).not.toContain('5 分钟 Demo 彩排已确认')
  })

  it('shows a fail-loud message when POC Hypercare acceptance cannot be loaded during initialization', async () => {
    readPocHypercareAcceptanceRecordBackendFirst.mockRejectedValue(new Error('hypercare acceptance backend unavailable'))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(readPocHypercareAcceptanceRecordBackendFirst).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('生产运营控制塔')
    expect(wrapper.text()).toContain('上线验收记录读取失败')
    expect(wrapper.text()).toContain('POC Hypercare 验收状态暂未加载')
    expect(wrapper.text()).toContain('hypercare acceptance backend unavailable')
  })

  it('shows a fail-loud message when dashboard data cannot be loaded during initialization', async () => {
    getDashboard.mockRejectedValue(new Error('dashboard backend unavailable'))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(getDashboard).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('生产运营控制塔')
    expect(wrapper.text()).toContain('生产概览数据读取失败')
    expect(wrapper.text()).toContain('KPI、设备状态、今日排产与物料预警暂未加载')
    expect(wrapper.text()).toContain('dashboard backend unavailable')
  })

  it('shows a fail-loud message when the latest A/B report cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('latest A/B report asset unavailable')
    }))

    const wrapper = mountDashboardBoard()
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith('reports/latest-ab-report.json', { cache: 'no-store' })
    expect(wrapper.text()).toContain('A/B 报告读取失败')
    expect(wrapper.text()).toContain('OTD 改善暂用默认演示值')
    expect(wrapper.text()).toContain('latest A/B report asset unavailable')
    expect(wrapper.text()).toContain('26.7% -> 30.0%')
  })
})

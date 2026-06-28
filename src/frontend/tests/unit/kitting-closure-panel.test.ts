import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import KittingClosurePanel from '../../src/components/inventory/KittingClosurePanel.vue'

const writeShortageKittingEvent = vi.hoisted(() => vi.fn())
const readBomKittingPackage = vi.hoisted(() => vi.fn())
const readBomKittingPackageBackendFirst = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByType = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByTypeBackendFirst = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())

vi.mock('../../src/utils/shortage-risk-sync', () => ({
  readBomKittingPackage,
  readBomKittingPackageBackendFirst,
  writeShortageKittingEvent,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordByType,
  readAnomalyDispatchRecordByTypeBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

function mountKittingClosurePanel() {
  return mount(KittingClosurePanel)
}

describe('KittingClosurePanel', () => {
  beforeEach(() => {
    writeShortageKittingEvent.mockReset()
    upsertOtdEvidenceChainRecord.mockReset()
    readBomKittingPackage.mockReturnValue(null)
    readBomKittingPackageBackendFirst.mockResolvedValue(null)
    readAnomalyDispatchRecordByType.mockReturnValue(null)
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValue(null)
  })

  it('labels shortage event actions with work order and shortage context', async () => {
    const wrapper = mountKittingClosurePanel()
    await flushPromises()

    const firstButton = wrapper.findAll('.order-card button')[0]
    expect(firstButton.attributes('aria-label')).toBe('生成缺料排产事件：WO-RUSH-9001 / M-AL-6061 缺 19件')

    await firstButton.trigger('click')

    expect(writeShortageKittingEvent).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'M-AL-6061',
      workOrderNumber: 'WO-RUSH-9001',
      shortageQuantity: 19,
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'inventory-kitting-WO-RUSH-9001-M-AL-6061',
      statusLabel: '待齐套',
    }))
  })

  it('renders backend BOM kitting package material gaps with audit context', async () => {
    readBomKittingPackageBackendFirst.mockResolvedValueOnce({
      id: 'bom-kitting-BOM-A100-WO-RUSH-9001',
      bomCode: 'BOM-A100',
      bomVersion: 'V1.0',
      productName: '急单阀体组件',
      workOrderNumber: 'WO-RUSH-9001',
      scheduleWindow: '2026-05-20 14:00-22:00',
      statusLabel: '齐套缺口待排产复核',
      owner: '库存主管 / 调度主管',
      auditId: 'AUD-BOM-KIT-WO-RUSH-9001',
      traceId: 'TRACE-BOM-KIT-WO-RUSH-9001',
      createdAt: '2026-06-15T08:00:00.000Z',
      summary: 'BOM 展开后发现 M-AL-6061 缺口，需要进入排产复核。',
      items: [
        {
          materialCode: 'M-AL-6061',
          materialName: '铝合金 6061',
          requiredQuantity: 64,
          availableQuantity: 45,
          inboundQuantity: 20,
          shortageQuantity: 19,
          unit: '件',
          action: '采购加急并复核替代料。',
        },
        {
          materialCode: 'M-SEAL-20',
          materialName: '密封圈 20',
          requiredQuantity: 32,
          availableQuantity: 1300,
          inboundQuantity: 0,
          shortageQuantity: 0,
          unit: '件',
          action: '可直接发料。',
        },
      ],
    })
    const wrapper = mountKittingClosurePanel()
    await flushPromises()

    const panel = wrapper.get('.bom-kitting-package-panel')
    expect(panel.text()).toContain('BOM-A100 展开齐套包')
    expect(panel.text()).toContain('齐套缺口待排产复核')
    expect(panel.text()).toContain('TRACE-BOM-KIT-WO-RUSH-9001')
    expect(panel.text()).toContain('库存主管 / 调度主管')
    const cards = panel.findAll('.bom-kitting-package-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].classes()).toContain('shortage')
    expect(cards[0].text()).toContain('M-AL-6061')
    expect(cards[0].text()).toContain('缺 19件')
    expect(cards[0].text()).toContain('采购加急并复核替代料')
    expect(cards[1].classes()).not.toContain('shortage')
  })

  it('publishes material anomaly isolation as a kitting review event and OTD evidence', async () => {
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValueOnce({
      id: 'dispatch-material-lh-202605',
      anomalyId: 'ANOM-MAT-LH-202605',
      type: 'material',
      typeLabel: '物料批次',
      title: 'LH-202605 来料批次异常',
      workOrderNumber: 'WO-RUSH-9001',
      operationCode: 'OP-20',
      route: '库存齐套 -> 采购协同 -> AI 排产',
      owner: '库存主管',
      dueAt: '今日 18:00',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      deliveryImpact: '预计影响 2 单',
      scheduleWindow: '2026-05-20 14:00-22:00',
      suggestedAction: '隔离异常批次并启用备用批次',
      auditId: 'AUD-ANOM-MAT-LH-202605',
      traceId: 'TRACE-ANOM-MAT-LH-202605',
      status: 'routed',
      statusLabel: '已分流',
      createdAt: '2026-06-15T08:00:00.000Z',
      summary: '来料批次异常需要库存齐套复核。',
    })
    const wrapper = mountKittingClosurePanel()
    await flushPromises()

    const dispatchPanel = wrapper.get('.material-dispatch-panel')
    expect(dispatchPanel.text()).toContain('LH-202605 来料批次异常')
    expect(dispatchPanel.text()).toContain('WO-RUSH-9001 / WO-DEMO-1002')

    await dispatchPanel.get('button').trigger('click')

    expect(writeShortageKittingEvent).toHaveBeenCalledWith(expect.objectContaining({
      materialCode: 'LH-202605',
      materialName: '原料批次 LH-202605',
      workOrderNumber: 'WO-RUSH-9001',
      affectedOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      shortageQuantity: 16,
      suggestion: expect.stringContaining('隔离异常批次并启用备用批次'),
    }))
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledWith(expect.objectContaining({
      id: 'material-isolation-ANOM-MAT-LH-202605',
      stage: '库存齐套',
      title: 'LH-202605 来料批次异常批次隔离已进入齐套复核',
      object: 'WO-RUSH-9001 / WO-DEMO-1002',
      source: '库存齐套 / 库存主管',
      traceId: 'TRACE-ANOM-MAT-LH-202605',
      statusLabel: '批次隔离中',
    }))
    expect(wrapper.get('.sync-note').text()).toContain('批次隔离已同步 AI 排产')
    expect(wrapper.get('.sync-note').text()).toContain('LH-202605 缺 16 件')
  })
})

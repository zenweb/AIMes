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
})

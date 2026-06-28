import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLatestCustomerEquipmentFault,
  getLatestEquipmentDowntime,
  upsertCustomerEquipmentFault,
  upsertEquipmentDowntime,
} from '../../src/api/equipmentEvidence'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('equipment evidence api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('uses backend contract paths for equipment evidence reads and writes', async () => {
    const item = { equipmentCode: 'CNC-001', traceId: 'TRACE-EQ-001' }
    httpGet.mockResolvedValue({ data: item })
    httpPost.mockResolvedValue({ data: item })

    await getLatestEquipmentDowntime()
    await upsertEquipmentDowntime(item as never)
    await getLatestCustomerEquipmentFault()
    await upsertCustomerEquipmentFault(item as never)

    expect(httpGet.mock.calls).toEqual([
      ['/scheduling/equipment-downtime/latest', expect.objectContaining({ suppressErrorToast: true })],
      ['/scheduling/customer-equipment-fault/latest', expect.objectContaining({ suppressErrorToast: true })],
    ])
    expect(httpPost.mock.calls).toEqual([
      ['/scheduling/equipment-downtime', item],
      ['/scheduling/customer-equipment-fault', item],
    ])
  })

  it('falls back to null for optional equipment latest reads', async () => {
    httpGet.mockRejectedValue(new Error('equipment evidence backend unavailable'))

    await expect(getLatestEquipmentDowntime()).resolves.toBeNull()
    await expect(getLatestCustomerEquipmentFault()).resolves.toBeNull()
  })

  it('fails loud for equipment latest reads when requested', async () => {
    httpGet
      .mockRejectedValueOnce(new Error('equipment downtime backend unavailable'))
      .mockRejectedValueOnce(new Error('customer equipment fault backend unavailable'))

    await expect(getLatestEquipmentDowntime({ failLoud: true }))
      .rejects.toThrow('equipment downtime backend unavailable')
    await expect(getLatestCustomerEquipmentFault({ failLoud: true }))
      .rejects.toThrow('customer equipment fault backend unavailable')
  })

  it('treats missing latest equipment evidence as empty even when fail loud is requested', async () => {
    httpGet.mockRejectedValue({ response: { status: 404 } })

    await expect(getLatestEquipmentDowntime({ failLoud: true })).resolves.toBeNull()
    await expect(getLatestCustomerEquipmentFault({ failLoud: true })).resolves.toBeNull()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readCustomerEquipmentFaultEvidence,
  readCustomerEquipmentFaultEvidenceBackendFirst,
  readEquipmentDowntimeEvent,
  readEquipmentDowntimeEventBackendFirst,
  type EquipmentDowntimeEvent,
  writeCustomerEquipmentFaultEvidence,
  writeEquipmentDowntimeEvent,
} from '../../src/utils/equipment-risk-sync'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function downtime(overrides: Partial<EquipmentDowntimeEvent> = {}): EquipmentDowntimeEvent {
  return {
    equipmentCode: 'CNC-001',
    equipmentName: 'CNC-001 加工中心',
    downtimeHours: 4,
    affectedOrders: 'WO-2026-0042 / WO-RUSH-9001',
    alternativeEquipment: 'CNC-002 / CNC-003',
    maintenanceWindow: '今日夜班 22:00-02:00',
    protectionStrategy: '减少换线、优先关键订单、推荐预防维护窗口',
    createdAt: '2026-05-31T08:00:00.000Z',
    ...overrides,
  }
}

describe('equipment risk sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
  })

  it('persists downtime locally and syncs backend best-effort', async () => {
    const event = downtime()

    writeEquipmentDowntimeEvent(event)
    await vi.dynamicImportSettled()

    expect(readEquipmentDowntimeEvent()).toEqual(event)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/equipment-downtime', event)
  })

  it('falls back to local downtime when backend returns no record', async () => {
    const localEvent = downtime()
    writeEquipmentDowntimeEvent(localEvent)
    httpGet.mockResolvedValueOnce({ data: null })

    await expect(readEquipmentDowntimeEventBackendFirst()).resolves.toEqual(localEvent)
  })

  it('falls back to local downtime when backend returns a partial downtime payload', async () => {
    const localEvent = downtime()
    writeEquipmentDowntimeEvent(localEvent)
    httpGet.mockResolvedValueOnce({ data: { equipmentCode: 'CNC-001', downtimeHours: 4 } })

    await expect(readEquipmentDowntimeEventBackendFirst()).resolves.toEqual(localEvent)
  })

  it('fails loud for equipment downtime refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('equipment downtime backend unavailable'))

    await expect(readEquipmentDowntimeEventBackendFirst({ failLoud: true }))
      .rejects.toThrow('equipment downtime backend unavailable')
  })

  it('fails loud when equipment downtime backend returns an incomplete latest record', async () => {
    httpGet.mockResolvedValueOnce({ data: { equipmentCode: 'CNC-001', downtimeHours: 4 } })

    await expect(readEquipmentDowntimeEventBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回残缺设备停机审计载荷')
  })

  it('removes corrupt downtime JSON so scheduling does not reuse stale equipment risk', () => {
    localStorage.setItem('aimes_equipment_downtime_event', '{bad json')

    expect(readEquipmentDowntimeEvent()).toBeNull()
    expect(localStorage.getItem('aimes_equipment_downtime_event')).toBeNull()
  })

  it('removes incomplete downtime records that cannot explain affected orders', () => {
    localStorage.setItem('aimes_equipment_downtime_event', JSON.stringify({
      equipmentCode: 'CNC-001',
      downtimeHours: 4,
    }))

    expect(readEquipmentDowntimeEvent()).toBeNull()
    expect(localStorage.getItem('aimes_equipment_downtime_event')).toBeNull()
  })

  it('removes downtime records with blank audit text because scheduling cannot explain mitigation intent', () => {
    localStorage.setItem('aimes_equipment_downtime_event', JSON.stringify(downtime({
      equipmentName: '   ',
      protectionStrategy: '   ',
    })))

    expect(readEquipmentDowntimeEvent()).toBeNull()
    expect(localStorage.getItem('aimes_equipment_downtime_event')).toBeNull()
  })

  it('applies customer fault defaults while preserving supplied downtime evidence', async () => {
    const evidence = writeCustomerEquipmentFaultEvidence({
      equipmentCode: 'CNC-009',
      affectedOrders: 'WO-009',
      downtimeHours: 6,
      preparedAt: '2026-05-31T09:00:00.000Z',
    })
    await vi.dynamicImportSettled()

    expect(evidence).toMatchObject({
      equipmentCode: 'CNC-009',
      affectedOrders: 'WO-009',
      downtimeHours: 6,
      faultSamples: 12,
      preparedAt: '2026-05-31T09:00:00.000Z',
    })
    expect(readCustomerEquipmentFaultEvidence()).toEqual(evidence)
    expect(httpPost).toHaveBeenCalledWith('/scheduling/customer-equipment-fault', evidence)
  })

  it('removes incomplete customer fault evidence that cannot explain POC governance scope', () => {
    localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
      batchId: 'IMP-POC-EQ-FAULT-20260520-001',
      equipmentCode: 'CNC-001',
    }))

    expect(readCustomerEquipmentFaultEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_equipment_fault_evidence')).toBeNull()
  })

  it('falls back to local customer fault evidence when backend returns a partial telemetry payload', async () => {
    const localEvidence = writeCustomerEquipmentFaultEvidence({
      batchId: 'IMP-POC-EQ-FAULT-20260520-LOCAL',
      equipmentCode: 'CNC-009',
      affectedOrders: 'WO-009',
      downtimeHours: 6,
      capturedSignals: ['主轴振动', '维修工单'],
      preparedAt: '2026-05-31T09:00:00.000Z',
    })
    httpGet.mockResolvedValueOnce({
      data: {
        batchId: 'IMP-POC-EQ-FAULT-20260520-PARTIAL',
        equipmentCode: 'CNC-009',
        capturedSignals: [],
      },
    })

    await expect(readCustomerEquipmentFaultEvidenceBackendFirst()).resolves.toEqual(localEvidence)
  })

  it('fails loud for customer equipment fault refresh when requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('customer equipment fault backend unavailable'))

    await expect(readCustomerEquipmentFaultEvidenceBackendFirst({ failLoud: true }))
      .rejects.toThrow('customer equipment fault backend unavailable')
  })

  it('fails loud when customer equipment fault backend returns incomplete telemetry evidence', async () => {
    httpGet.mockResolvedValueOnce({
      data: {
        batchId: 'IMP-POC-EQ-FAULT-20260520-PARTIAL',
        equipmentCode: 'CNC-009',
        capturedSignals: [],
      },
    })

    await expect(readCustomerEquipmentFaultEvidenceBackendFirst({ failLoud: true }))
      .rejects.toThrow('后端返回残缺客户设备故障审计载荷')
  })

  it('removes customer fault evidence without captured signals because POC governance cannot audit telemetry lineage', () => {
    localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
      batchId: 'IMP-POC-EQ-FAULT-20260520-001',
      fileName: '客户真实设备故障样例_CNC-001.csv',
      source: '客户设备联网平台 / 点检历史导出',
      equipmentCode: 'CNC-001',
      faultSamples: 12,
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
      downtimeHours: 4,
      capturedSignals: [],
      preparedAt: '2026-05-31T09:00:00.000Z',
    }))

    expect(readCustomerEquipmentFaultEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_equipment_fault_evidence')).toBeNull()
  })

  it('removes customer fault evidence with blank lineage text so POC governance can trace telemetry source', () => {
    localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
      batchId: 'IMP-POC-EQ-FAULT-20260520-001',
      fileName: '   ',
      source: '   ',
      equipmentCode: 'CNC-001',
      faultSamples: 12,
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
      downtimeHours: 4,
      capturedSignals: ['主轴振动'],
      preparedAt: '2026-05-31T09:00:00.000Z',
    }))

    expect(readCustomerEquipmentFaultEvidence()).toBeNull()
    expect(localStorage.getItem('aimes_customer_equipment_fault_evidence')).toBeNull()
  })
})

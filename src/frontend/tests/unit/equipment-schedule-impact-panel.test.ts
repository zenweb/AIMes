import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EquipmentScheduleImpactPanel from '../../src/components/equipment/EquipmentScheduleImpactPanel.vue'

const readCustomerEquipmentFaultEvidenceBackendFirst = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordByTypeBackendFirst = vi.hoisted(() => vi.fn())
const writeCustomerEquipmentFaultEvidence = vi.hoisted(() => vi.fn())
const writeEquipmentDowntimeEvent = vi.hoisted(() => vi.fn())
const upsertOtdEvidenceChainRecord = vi.hoisted(() => vi.fn())

vi.mock('../../src/utils/equipment-risk-sync', () => ({
  readCustomerEquipmentFaultEvidence: vi.fn(() => null),
  readCustomerEquipmentFaultEvidenceBackendFirst,
  writeCustomerEquipmentFaultEvidence,
  writeEquipmentDowntimeEvent,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  upsertOtdEvidenceChainRecord,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordByType: vi.fn(() => null),
  readAnomalyDispatchRecordByTypeBackendFirst,
}))

describe('EquipmentScheduleImpactPanel', () => {
  beforeEach(() => {
    readCustomerEquipmentFaultEvidenceBackendFirst.mockResolvedValue(null)
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValue(null)
    writeCustomerEquipmentFaultEvidence.mockReset()
    writeCustomerEquipmentFaultEvidence.mockReturnValue(null)
    writeEquipmentDowntimeEvent.mockClear()
    upsertOtdEvidenceChainRecord.mockClear()
  })

  it('announces downtime sync results as a status update', async () => {
    const wrapper = mount(EquipmentScheduleImpactPanel)
    await flushPromises()

    await wrapper.get('.sync-btn').trigger('click')

    const note = wrapper.get('.sync-note')
    expect(note.text()).toContain('设备故障已同步 AI 排产')
    expect(note.attributes('role')).toBe('status')
    expect(note.attributes('aria-live')).toBe('polite')
    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledOnce()
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledOnce()
  })

  it('keeps equipment downtime sync failures visible instead of announcing success', async () => {
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('equipment OTD evidence storage unavailable')
    })
    const wrapper = mount(EquipmentScheduleImpactPanel)
    await flushPromises()

    await wrapper.get('.sync-btn').trigger('click')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('alert')
    expect(note.text()).toContain('设备故障同步失败')
    expect(note.text()).toContain('排产/OTD 证据未完整归档')
    expect(note.text()).toContain('equipment OTD evidence storage unavailable')
    expect(note.text()).not.toContain('设备故障已同步 AI 排产')
    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledOnce()
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledOnce()
  })

  it('keeps customer fault evidence failures visible instead of announcing import success', async () => {
    writeCustomerEquipmentFaultEvidence.mockReturnValue({
      batchId: 'IMP-POC-EQ-FAULT-20260520-001',
      fileName: '客户真实设备故障样例_CNC-001.csv',
      source: '客户设备联网平台 / 点检历史导出',
      equipmentCode: 'CNC-001',
      faultSamples: 12,
      affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
      downtimeHours: 4,
      capturedSignals: ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'],
      preparedAt: '2026-05-20T10:00:00.000Z',
    })
    upsertOtdEvidenceChainRecord
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => {
        throw new Error('customer equipment fault OTD evidence storage unavailable')
      })
    const wrapper = mount(EquipmentScheduleImpactPanel)
    await flushPromises()

    await wrapper.get('.customer-fault-panel .sync-btn').trigger('click')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('alert')
    expect(note.text()).toContain('客户设备故障样例同步失败')
    expect(note.text()).toContain('POC/OTD 证据未完整归档')
    expect(note.text()).toContain('customer equipment fault OTD evidence storage unavailable')
    expect(note.text()).not.toContain('客户设备故障样例已接入')
    expect(writeCustomerEquipmentFaultEvidence).toHaveBeenCalledOnce()
    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledOnce()
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledTimes(2)
  })

  it('keeps dispatch maintenance evidence failures visible instead of announcing sync success', async () => {
    readAnomalyDispatchRecordByTypeBackendFirst.mockResolvedValue({
      id: 'anomaly-dispatch-ANOM-EQ-CNC001-20260521',
      anomalyId: 'ANOM-EQ-CNC001-20260521',
      type: 'equipment',
      typeLabel: '设备异常',
      title: 'CNC-001 主轴温升异常已分流到设备维护与排产复核',
      workOrderNumber: 'WO-20260501',
      operationCode: 'OP-020',
      route: '机加工',
      owner: '设备工程师 李工',
      dueAt: '2026-05-21T18:00:00.000Z',
      affectedOrders: 'WO-20260501 / WO-2026-0042',
      deliveryImpact: '高优先级交付风险',
      scheduleWindow: '今日夜班 22:00-02:00',
      suggestedAction: 'CNC-003 分流并复核主轴冷却',
      auditId: 'AUDIT-ANOM-EQ-CNC001-20260521',
      traceId: 'TRACE-ANOMALY-DISPATCH-EQUIPMENT-CNC001-20260521',
      status: 'routed',
      statusLabel: '已分流',
      createdAt: '2026-05-21T10:00:00.000Z',
      summary: '设备异常已确认进入维护复核。',
    })
    upsertOtdEvidenceChainRecord.mockImplementationOnce(() => {
      throw new Error('dispatch maintenance OTD evidence storage unavailable')
    })
    const wrapper = mount(EquipmentScheduleImpactPanel)
    await flushPromises()

    await wrapper.get('.dispatch-maintenance-panel .sync-btn').trigger('click')

    const note = wrapper.get('.sync-note')
    expect(note.attributes('role')).toBe('alert')
    expect(note.text()).toContain('异常分流维护单同步失败')
    expect(note.text()).toContain('维护/OTD 证据未完整归档')
    expect(note.text()).toContain('dispatch maintenance OTD evidence storage unavailable')
    expect(note.text()).not.toContain('异常分流维护单已同步')
    expect(writeEquipmentDowntimeEvent).toHaveBeenCalledOnce()
    expect(upsertOtdEvidenceChainRecord).toHaveBeenCalledOnce()
  })
})

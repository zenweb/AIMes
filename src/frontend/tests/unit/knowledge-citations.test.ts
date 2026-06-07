import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import { findAssistantCitationTrace } from '../../src/utils/knowledge-citations'

describe('knowledge citations', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
  })

  it('keeps barcode quality reuse under review when the stored sample has no reusable evidence chain', () => {
    localStorage.setItem('aimes_quality_knowledge_samples', JSON.stringify([
      {
        id: 'quality-knowledge-barcode-rework-wo-demo-1007',
        workOrderId: 'WO-DEMO-1007',
        operationCode: 'OP-20',
        processName: '装配扭矩复验',
        equipmentCode: 'TORQUE-ST-01',
        materialBatch: 'BATCH-20260531-A',
        defectPattern: '扫码返工后扭矩偏移',
        documentId: 'kg-quality-barcode-rework',
        documentTitle: '扫码返工 CAPA 复用样本',
        version: 'V1.0',
        validUntil: '2026-12-31',
        auditId: 'AUD-QK-BARCODE-REWORK-20260531-001',
        traceId: 'TRACE-QK-BARCODE-REWORK-WO-DEMO-1007',
        createdAt: '2026-05-31T08:00:00.000Z',
        summary: '缺少可复用 CAPA 推荐与证据链的样本不能支撑正式引用。',
        capaRecommendations: [],
        reuseTargets: [],
        evidenceTraceIds: [],
      },
    ]))

    const trace = findAssistantCitationTrace('扫码返工同类质量问题如何复用 CAPA 推荐？')

    expect(trace).toEqual(expect.objectContaining({
      id: 'barcode-quality-reuse',
      status: '需复核',
    }))
    expect(trace?.blockedSource).toContain('尚未沉淀')
  })
})

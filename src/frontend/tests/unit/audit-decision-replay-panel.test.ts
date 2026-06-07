import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuditDecisionReplayPanel from '../../src/components/auditLog/AuditDecisionReplayPanel.vue'
import type { AuditLog, AuditLogDetail } from '../../src/types/auditLog'

const getAuditLogDetail = vi.hoisted(() => vi.fn())
const getAuditLogs = vi.hoisted(() => vi.fn())
const readAssistantActionAuditsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readAgentConfigApprovalsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readPocReviewSignoffRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const buildQualityKnowledgeRecommendationExperimentCandidateRecords = vi.hoisted(() => vi.fn(() => []))
const buildQualityKnowledgeGrayReleaseMonitorRecords = vi.hoisted(() => vi.fn(() => []))
const qualityKnowledgeGrayReleaseCycleLabel = vi.hoisted(() => vi.fn(() => ''))
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readQualityKnowledgeRetrainingVersionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))

vi.mock('../../src/api/auditLog', () => ({
  getAuditLogDetail,
  getAuditLogs,
}))

vi.mock('../../src/utils/assistant-action-audit', () => ({
  readAssistantActionAuditsBackendFirst,
}))

vi.mock('../../src/utils/quality-capa-sync', () => ({
  readQualityCapaClosureBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/poc-evidence-governance', () => ({
  readPocEvidenceGovernanceRecordsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/agent-config-approval-sync', () => ({
  approvalStatusLabel: (status: string) => status,
  isApprovalOpen: vi.fn((status: string) => status === 'pending' || status === 'reviewing'),
  readAgentConfigApprovalsBackendFirst,
}))

vi.mock('../../src/utils/poc-review-signoff-sync', () => ({
  readPocReviewSignoffRecordBackendFirst,
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords: vi.fn(() => []),
}))

vi.mock('../../src/utils/knowledge-governance-sync', () => ({
  readKnowledgeGovernanceReviewsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  buildQualityKnowledgeRecommendationExperimentCandidateRecords,
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  qualityKnowledgeGrayReleaseCycleLabel,
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst,
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst,
}))

function mountAuditDecisionReplayPanel() {
  return mount(AuditDecisionReplayPanel, {
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

describe('AuditDecisionReplayPanel', () => {
  beforeEach(() => {
    const localStorageStub = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageStub)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorageStub,
    })
    getAuditLogs.mockResolvedValue({ items: [] })
    getAuditLogDetail.mockResolvedValue(null)
    readAssistantActionAuditsBackendFirst.mockResolvedValue([])
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([])
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue(null)
    buildQualityKnowledgeRecommendationExperimentCandidateRecords.mockReturnValue([])
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([])
    qualityKnowledgeGrayReleaseCycleLabel.mockReturnValue('')
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst.mockResolvedValue([])
    readQualityKnowledgeRetrainingVersionRecordsBackendFirst.mockResolvedValue([])
  })

  it('marks the selected replay action for assistive technology', async () => {
    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const buttons = wrapper.findAll('.replay-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-label')).toBe('回放决策链：M-AL-6061 收货后释放冻结工序')

    await buttons[1].trigger('click')
    await flushPromises()

    expect(buttons[0].attributes('aria-pressed')).toBe('false')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.replay-detail').text()).toContain('M-AL-6061 收货后释放冻结工序 回放链')
  })

  it('exposes the selected replay chain as a named status region', async () => {
    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const detail = wrapper.get('.replay-detail')
    expect(detail.attributes('role')).toBe('region')
    expect(detail.attributes('aria-live')).toBe('polite')
    expect(detail.attributes('aria-labelledby')).toBe('audit-replay-detail-title')
    expect(detail.get('#audit-replay-detail-title').text()).toBe('WO-RUSH-9001 急单插入重排建议 回放链')
  })

  it('replays backend business-write audit entries with a labelled business-object link', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-po-1',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-1',
      createdAt: '2026-06-01T09:30:00Z',
      traceId: 'TRACE-PO-001',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-1',
          orderNumber: 'PO-RUSH-20260519',
          materialCode: 'M-AL-6061',
          receivedQuantity: 64,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }

    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [auditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 1 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-RUSH-20260519 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-1 / M-AL-6061 / 收货 64')

    const link = wrapper.get('.trace-link')
    expect(link.text()).toBe('打开采购协同')
    expect(link.attributes('aria-label')).toBe('打开采购协同：PO-RUSH-20260519')
  })

  it('keeps replay cards visible and alerts when backend business-write audits fail to load', async () => {
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') throw new Error('audit log API unavailable')
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('audit log API unavailable')
  })

  it('keeps replay cards visible and alerts when backend business-write audit list payload is not an array', async () => {
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') {
        return {
          items: { rows: [] },
          totalCount: 1,
          totalPages: 1,
        }
      }
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('keeps successful business-write replay entries when one audit action fails to load', async () => {
    const auditListItem: AuditLog = {
      id: 'audit-po-partial',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-partial',
      createdAt: '2026-06-01T09:40:00Z',
      traceId: 'TRACE-PO-PARTIAL',
    }
    const auditDetail: AuditLogDetail = {
      ...auditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商部分到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-partial',
          orderNumber: 'PO-PARTIAL-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 32,
          status: 'PartiallyReceived',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => {
      if (action === 'AgentExecutePurchaseAction') {
        return {
          items: [auditListItem],
          totalCount: 1,
          totalPages: 1,
        }
      }
      if (action === 'AgentExecuteQualityDisposition') throw new Error('quality audit API unavailable')
      return {
        items: [],
        totalCount: 0,
        totalPages: 1,
      }
    })
    getAuditLogDetail.mockResolvedValue(auditDetail)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-PARTIAL-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-partial / M-AL-6061 / 收货 32')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计加载失败')
    expect(alert.text()).toContain('quality audit API unavailable')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail fails to load', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-detail-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-ok',
      createdAt: '2026-06-01T09:45:00Z',
      traceId: 'TRACE-PO-DETAIL-OK',
    }
    const failedAuditListItem: AuditLog = {
      id: 'audit-po-detail-failed',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-failed',
      createdAt: '2026-06-01T09:46:00Z',
      traceId: 'TRACE-PO-DETAIL-FAILED',
    }
    const auditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-detail-ok',
          orderNumber: 'PO-DETAIL-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 48,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, failedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) => {
      if (id === 'audit-po-detail-failed') throw new Error('audit detail unavailable')
      return auditDetail
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-DETAIL-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-detail-ok / M-AL-6061 / 收货 48')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit detail unavailable')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is not a detail object', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-detail-shape-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-shape-ok',
      createdAt: '2026-06-01T09:45:00Z',
      traceId: 'TRACE-PO-DETAIL-SHAPE-OK',
    }
    const malformedDetailAuditListItem: AuditLog = {
      id: 'audit-po-detail-shape-broken',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-detail-shape-broken',
      createdAt: '2026-06-01T09:46:00Z',
      traceId: 'TRACE-PO-DETAIL-SHAPE-BROKEN',
    }
    const auditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-detail-shape-ok',
          orderNumber: 'PO-DETAIL-SHAPE-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 44,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, malformedDetailAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-po-detail-shape-broken' ? { items: [] } : auditDetail
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-DETAIL-SHAPE-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-detail-shape-ok / M-AL-6061 / 收货 44')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-po-detail-shape-broken 后端返回非对象审计载荷')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is malformed', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-payload-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-payload-ok',
      createdAt: '2026-06-01T09:50:00Z',
      traceId: 'TRACE-PO-PAYLOAD-OK',
    }
    const malformedAuditListItem: AuditLog = {
      id: 'audit-po-payload-broken',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-payload-broken',
      createdAt: '2026-06-01T09:51:00Z',
      traceId: 'TRACE-PO-PAYLOAD-BROKEN',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-payload-ok',
          orderNumber: 'PO-PAYLOAD-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 40,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const malformedAuditDetail: AuditLogDetail = {
      ...malformedAuditListItem,
      oldValues: null,
      newValues: '{broken-business-write-payload',
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, malformedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-po-payload-broken' ? malformedAuditDetail : successfulAuditDetail
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-PAYLOAD-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-payload-ok / M-AL-6061 / 收货 40')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-po-payload-broken 审计载荷解析失败')
  })

  it('keeps successful business-write replay entries and alerts when one business-write resource is unsupported', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-resource-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-resource-ok',
      createdAt: '2026-06-01T09:55:00Z',
      traceId: 'TRACE-PO-RESOURCE-OK',
    }
    const unsupportedAuditListItem: AuditLog = {
      id: 'audit-unsupported-resource',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-unsupported-resource',
      createdAt: '2026-06-01T09:56:00Z',
      traceId: 'TRACE-UNSUPPORTED-RESOURCE',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-resource-ok',
          orderNumber: 'PO-RESOURCE-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 36,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const unsupportedAuditDetail: AuditLogDetail = {
      ...unsupportedAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'TransferWarehouseStock',
        reason: '仓库间调拨释放缺料工序',
        businessWrite: {
          resource: 'warehouse-transfer',
          materialCode: 'M-AL-6061',
          receivedQuantity: 12,
          status: 'Transferred',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, unsupportedAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-unsupported-resource' ? unsupportedAuditDetail : successfulAuditDetail
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-RESOURCE-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-resource-ok / M-AL-6061 / 收货 36')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-unsupported-resource 不支持的业务落库资源：warehouse-transfer')
  })

  it('keeps successful business-write replay entries and alerts when one audit detail payload is missing', async () => {
    const successfulAuditListItem: AuditLog = {
      id: 'audit-po-missing-payload-ok',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-missing-payload-ok',
      createdAt: '2026-06-01T10:00:00Z',
      traceId: 'TRACE-PO-MISSING-PAYLOAD-OK',
    }
    const missingPayloadAuditListItem: AuditLog = {
      id: 'audit-missing-payload',
      userId: 'agent.service',
      action: 'AgentExecutePurchaseAction',
      resource: 'AgentDecision',
      resourceId: 'decision-missing-payload',
      createdAt: '2026-06-01T10:01:00Z',
      traceId: 'TRACE-MISSING-PAYLOAD',
    }
    const successfulAuditDetail: AuditLogDetail = {
      ...successfulAuditListItem,
      oldValues: null,
      newValues: JSON.stringify({
        requestActionName: 'ConfirmPurchaseReceipt',
        reason: '供应商到货后释放缺料工序',
        businessWrite: {
          resource: 'purchase-order',
          purchaseOrderId: 'po-missing-payload-ok',
          orderNumber: 'PO-MISSING-PAYLOAD-OK-20260520',
          materialCode: 'M-AL-6061',
          receivedQuantity: 28,
          status: 'Received',
        },
      }),
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    const missingPayloadAuditDetail: AuditLogDetail = {
      ...missingPayloadAuditListItem,
      oldValues: null,
      newValues: null,
      ipAddress: '10.0.0.8',
      userAgent: 'AgentExecutor',
    }
    getAuditLogs.mockImplementation(async (action: string) => ({
      items: action === 'AgentExecutePurchaseAction' ? [successfulAuditListItem, missingPayloadAuditListItem] : [],
      totalCount: action === 'AgentExecutePurchaseAction' ? 2 : 0,
      totalPages: 1,
    }))
    getAuditLogDetail.mockImplementation(async (id: string) =>
      id === 'audit-missing-payload' ? missingPayloadAuditDetail : successfulAuditDetail
    )

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('采购收货落库：PO-MISSING-PAYLOAD-OK-20260520 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('业务写入 purchase-order：po-missing-payload-ok / M-AL-6061 / 收货 28')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('业务落库审计详情加载失败')
    expect(alert.text()).toContain('audit-missing-payload 审计载荷缺失')
  })

  it('exposes pending configuration approvals as a labelled review list', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([
      {
        id: 'cfg-lock-window',
        title: 'Scheduling.LockWindowHours 8h -> 10h',
        replayTitle: '锁定期保护从 8 小时调整为 10 小时',
        configKey: 'Scheduling.LockWindowHours',
        fromValue: '8h',
        toValue: '10h',
        reason: '客户要求冻结当天早班计划，降低现场频繁换线。',
        owner: '生产经理审批',
        status: 'pending',
        auditId: 'TRACE-CFG-20260520-002',
        submittedBy: 'admin',
        submittedAt: '2026-05-20T10:30:00.000Z',
        risk: '锁定期扩大可能降低急单响应速度。',
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    const approvalList = wrapper.get('.approval-lane')
    expect(approvalList.attributes('role')).toBe('list')
    expect(approvalList.attributes('aria-label')).toBe('关键配置变更审批')

    const approvalBadge = wrapper.get('.approval-badge')
    expect(approvalBadge.attributes('role')).toBe('status')
    expect(approvalBadge.attributes('aria-live')).toBe('polite')
    expect(approvalBadge.text()).toBe('1 个配置待审批')

    const approvalRow = wrapper.get('.approval-row')
    expect(approvalRow.attributes('role')).toBe('listitem')
    expect(approvalRow.attributes('aria-label')).toBe('审批项：Scheduling.LockWindowHours 8h -> 10h，状态 pending，责任人 生产经理审批')
  })

  it('keeps replay cards visible and alerts when configuration approvals fail to load', async () => {
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(new Error('approval backend unavailable'))

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('approval backend unavailable')
    expect(wrapper.get('.approval-badge').text()).toBe('0 个配置待审批')
  })

  it('keeps replay cards visible and alerts when configuration approval payload is not an array', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('配置审批加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
    expect(wrapper.get('.approval-badge').text()).toBe('0 个配置待审批')
  })

  it('keeps base replay cards visible and alerts when assistant action audit payload is not an array', async () => {
    readAssistantActionAuditsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('助手动作审计加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })

  it('links POC review signoff replay back to report evidence', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue({
      id: 'poc-review-signoff-20260602',
      meetingId: 'POC-REVIEW-20260602-001',
      targetCustomer: '离散制造工厂 POC',
      totalScore: 92,
      passScore: 85,
      result: 'approved',
      signedBy: '客户代表 / 项目经理',
      signedAt: '2026-06-02T01:20:00.000Z',
      reviewers: ['客户厂长', '调度主管'],
      evidenceBatches: ['BATCH-OTD-20260602', 'BATCH-AUDIT-20260602'],
      auditId: 'AUD-POC-REVIEW-20260602',
      summary: '复盘证据齐套，评分达到通过线。',
    })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('POC 复盘会评分表签署 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('核对证据批次：BATCH-OTD-20260602、BATCH-AUDIT-20260602。')

    const link = wrapper.get('.trace-link')
    expect(link.text()).toBe('打开报表中心')
    expect(link.attributes('aria-label')).toBe('打开报表中心：POC-REVIEW-20260602-001')
  })

  it('keeps base replay cards visible and alerts when the POC review signoff payload is malformed', async () => {
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue({
      id: 'poc-review-signoff-malformed',
      meetingId: 'POC-REVIEW-MALFORMED',
      targetCustomer: '离散制造工厂 POC',
      totalScore: 92,
      passScore: 85,
      result: 'approved',
      signedBy: '客户代表 / 项目经理',
      signedAt: '2026-06-02T01:20:00.000Z',
      auditId: 'AUD-POC-REVIEW-MALFORMED',
      summary: '复盘证据齐套，评分达到通过线。',
    } as never)

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('POC 复盘签署加载失败')
    expect(alert.text()).toContain('poc-review-signoff-malformed 复盘签署审计载荷缺失')
  })

  it('selects a quality gray release rollback decision as the default replay chain', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([
      {
        id: 'quality-gray-release-decision-r3-rollback',
        monitorId: 'quality-gray-release-monitor-r3',
        trainingSetVersion: 'QK-TRAIN-20260521-R3',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        releaseCycleLabel: '重新灰度发布',
        releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
        releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
        releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
        decision: 'rolled_back',
        decisionLabel: '回滚到 R2 正式版',
        statusClass: 'guarded',
        decidedBy: '质量主管 刘工 / 知识库管理员',
        decidedAt: '2026-05-21T15:55:00.000Z',
        auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
        reason: '重新灰度发布后仍要求保守验证，二次回滚到 R2 正式版。',
        approvalStatus: 'not_required',
        approvalLabel: '回滚无需扩大审批',
        rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
        reviewIssueId: 'R3-REPUBLISH-REVIEW-ISSUE-20260521-001',
        reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REPUBLISH-REVIEW-ISSUE',
        reviewIssueStatus: 'open',
        reviewIssueLabel: '待复核',
        metricSnapshot: [
          { label: '推荐采纳率', value: '100%' },
          { label: '复验通过率', value: '100%' },
          { label: '负样本误召回', value: '0 次' },
        ],
        actions: ['重新灰度发布周期从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
      },
    ])

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.get('.replay-detail h4').text()).toBe('QK-TRAIN-20260521-R3 回滚到 R2 正式版回放 · 重新灰度发布 回放链')
    expect(wrapper.get('.replay-detail').text()).toContain('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK')
    expect(wrapper.get('.replay-detail').text()).toContain('重新灰度发布发布证据：AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')
    expect(wrapper.get('.replay-detail').text()).toContain('QK-TRAIN-20260521-R3 已从 active 推荐中排除')
    expect(wrapper.get('.replay-detail').text()).toContain('R3-REPUBLISH-REVIEW-ISSUE-20260521-001 待复核问题单已打开')
    expect(wrapper.get('.replay-metrics').text()).toContain('质量灰度回放')
    expect(wrapper.find('.replay-sync-alert').exists()).toBe(false)
  })

  it('keeps base replay cards visible and alerts when quality gray release decisions are not an array', async () => {
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAuditDecisionReplayPanel()
    await flushPromises()

    expect(wrapper.findAll('.decision-card')).toHaveLength(2)
    expect(wrapper.get('.replay-detail h4').text()).toContain('WO-RUSH-9001 急单插入重排建议 回放链')
    const alert = wrapper.get('.replay-sync-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('质量灰度决策加载失败')
    expect(alert.text()).toContain('后端返回非数组审计载荷')
  })
})

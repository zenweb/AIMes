import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RiskActionQueuePanel from '../../src/components/risk/RiskActionQueuePanel.vue'

const appendRiskActionTrace = vi.hoisted(() => vi.fn())
const readProductionAnomalyEventBackendFirst = vi.hoisted(() => vi.fn())
const readAnomalyDispatchRecordsBackendFirst = vi.hoisted(() => vi.fn())
const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn())
const readRiskSlaReviewRecordBackendFirst = vi.hoisted(() => vi.fn())
const writeRiskSlaReviewRecord = vi.hoisted(() => vi.fn())
const closeRiskSlaReviewRecord = vi.hoisted(() => vi.fn())
const readMonitoringSituationEscalationsBackendFirst = vi.hoisted(() => vi.fn())
const closeMonitoringSituationEscalation = vi.hoisted(() => vi.fn())

vi.mock('../../src/utils/production-anomaly-sync', () => ({
  readProductionAnomalyEventBackendFirst,
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordsBackendFirst,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/risk-action-sync', () => ({
  appendRiskActionTrace,
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  closeRiskSlaReviewRecord,
  readRiskSlaReviewRecordBackendFirst,
  writeRiskSlaReviewRecord,
}))

vi.mock('../../src/utils/monitoring-situation-escalation-sync', () => ({
  closeMonitoringSituationEscalation,
  readMonitoringSituationEscalationsBackendFirst,
}))

function mountRiskActionQueuePanel() {
  return mount(RiskActionQueuePanel)
}

describe('RiskActionQueuePanel', () => {
  beforeEach(() => {
    appendRiskActionTrace.mockReset()
    writeRiskSlaReviewRecord.mockReset()
    closeRiskSlaReviewRecord.mockReset()
    closeMonitoringSituationEscalation.mockReset()
    readProductionAnomalyEventBackendFirst.mockResolvedValue(null)
    readAnomalyDispatchRecordsBackendFirst.mockResolvedValue([])
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
    readRiskSlaReviewRecordBackendFirst.mockResolvedValue(null)
    writeRiskSlaReviewRecord.mockReturnValue({
      title: '风险 SLA 逾期晨会复核包',
      reviewMeetingId: 'RISK-SLA-20260601',
      auditId: 'AUD-RISK-SLA-001',
      status: 'escalated',
      statusLabel: '已升级晨会复核',
      summary: '风险 SLA 逾期晨会复核包已生成。',
      overdueCount: 1,
      criticalCount: 1,
      otdImpact: '-2 单延期风险待复核',
      risks: [],
      actions: [],
      traceId: 'TRACE-RISK-SLA-001',
    })
    closeRiskSlaReviewRecord.mockReturnValue({
      title: '风险 SLA 逾期晨会复核包',
      reviewMeetingId: 'RISK-SLA-20260601',
      auditId: 'AUD-RISK-SLA-001',
      status: 'closed',
      statusLabel: '晨会责任动作已闭环',
      summary: '责任动作已闭环。',
      overdueCount: 1,
      criticalCount: 1,
      otdImpact: '+6% OTD 恢复动作已锁定',
      risks: [],
      actions: [],
      traceId: 'TRACE-RISK-SLA-001',
      closureSummary: '生产经理 已确认责任动作全部闭环。',
      closureAuditId: 'AUD-RISK-SLA-CLOSURE-001',
      closureTraceId: 'TRACE-RISK-SLA-CLOSED-001',
    })
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValue([])
  })

  it('labels card escalation actions with the risk title and preserves escalation behavior', async () => {
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    expect(firstCard.get('h4').text()).toBe('WO-2026-0042 CNC 停机延期')

    const escalateButton = firstCard.findAll('.card-actions button')[1]
    expect(escalateButton.attributes('aria-label')).toBe('升级风险：WO-2026-0042 CNC 停机延期')

    await escalateButton.trigger('click')

    expect(firstCard.get('.card-topline em').text()).toBe('已升级')
    expect(appendRiskActionTrace).toHaveBeenCalledWith(expect.objectContaining({
      title: 'WO-2026-0042 CNC 停机延期',
      status: 'escalated',
      statusLabel: '已升级',
    }))
  })

  it('shows bilingual SLA review guidance with related evidence links and help support', async () => {
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const guidance = wrapper.get('.risk-sla-guidance')
    expect(guidance.attributes('id')).toBe('risk-sla-review-help')
    expect(guidance.text()).toContain('生成或关闭晨会复核前，请核对逾期风险、责任动作、排产保护和审计留痕。')
    expect(guidance.text()).toContain('Before generating or closing the daily review, verify overdue risks, accountable actions, scheduling protection, and audit trail.')

    const links = guidance.findAll('a')
    expect(links.map(link => link.text())).toEqual([
      'AI 排产 / Scheduling',
      '报表证据 / Reports',
      '审计回放 / Audit trail',
      '帮助 / Help',
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/scheduling',
      '/report',
      '/audit-logs',
      '#risk-sla-review-help',
    ])
    expect(wrapper.get('.sla-review-panel').attributes('aria-describedby')).toBe('risk-sla-review-help')
  })

  it('keeps the risk open when escalation trace cannot be archived', async () => {
    appendRiskActionTrace.mockImplementationOnce(() => {
      throw new Error('risk trace storage unavailable')
    })
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    const escalateButton = firstCard.findAll('.card-actions button')[1]

    await escalateButton.trigger('click')
    await flushPromises()

    expect(firstCard.get('.card-topline em').text()).toBe('待处置')
    expect(firstCard.text()).toContain('负责人：调度员 李工')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险升级失败')
    expect(alert.text()).toContain('risk trace storage unavailable')
    expect(wrapper.text()).not.toContain('WO-2026-0042 CNC 停机延期 已升级为跨部门处置')
  })

  it('keeps the risk open when reassignment trace cannot be archived', async () => {
    appendRiskActionTrace.mockImplementationOnce(() => {
      throw new Error('risk reassignment trace storage unavailable')
    })
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    const reassignButton = firstCard.findAll('.card-actions button')[0]

    await reassignButton.trigger('click')
    await flushPromises()

    expect(firstCard.get('.card-topline em').text()).toBe('待处置')
    expect(firstCard.text()).toContain('负责人：调度员 李工')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险转派失败')
    expect(alert.text()).toContain('risk reassignment trace storage unavailable')
    expect(wrapper.text()).not.toContain('WO-2026-0042 CNC 停机延期 已转派给 班组长 孙八')
  })

  it('keeps the risk open when close trace cannot be archived', async () => {
    appendRiskActionTrace.mockImplementationOnce(() => {
      throw new Error('risk close trace storage unavailable')
    })
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    const closeButton = firstCard.findAll('.card-actions button')[2]

    await closeButton.trigger('click')
    await flushPromises()

    expect(firstCard.get('.card-topline em').text()).toBe('待处置')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险关闭失败')
    expect(alert.text()).toContain('risk close trace storage unavailable')
    expect(wrapper.text()).not.toContain('WO-2026-0042 CNC 停机延期 已关闭，处置结果将进入 OTD 复盘与审计日志。')
  })

  it('does not close monitoring situation packages when close trace cannot be archived', async () => {
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValueOnce([{
      id: 'monitoring-situation-sf-001',
      sourceEventId: 'sf-001',
      title: 'CNC 现场态势升级处置包',
      source: '实时监控',
      workOrders: 'WO-RUSH-9001',
      priority: 'critical',
      owner: '生产经理审批',
      dueAt: '今日 11:30',
      auditId: 'AUD-SF-ESC-SF-001-20260521',
      traceId: 'TRACE-SF-ESC-SF-001',
      status: 'escalated',
      statusLabel: '待跨模块处置',
      scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
      scheduleAction: '冻结当前瓶颈任务并复核缺料窗口。',
      riskImpact: '现场态势已升级为跨模块处置包。',
      riskSuggestion: '风险队列升级给生产经理。',
      otdImpact: '+6%',
      delayImpact: '-1 单延期风险 / -4h 瓶颈等待',
      changeoverImpact: '+10min 可控',
      summary: '现场态势触发跨模块处置。',
      evidence: ['TRACE-SF-SF-001'],
      dispatchSteps: ['实时监控识别风险。'],
      createdAt: '2026-06-05T02:00:00.000Z',
    }])
    appendRiskActionTrace.mockImplementationOnce(() => {
      throw new Error('monitoring close trace storage unavailable')
    })

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const monitoringCard = wrapper.get('.action-card')
    expect(monitoringCard.get('h4').text()).toBe('CNC 现场态势升级处置包')

    await monitoringCard.findAll('.card-actions button')[2].trigger('click')
    await flushPromises()

    expect(monitoringCard.get('.card-topline em').text()).toBe('已升级')
    expect(closeMonitoringSituationEscalation).not.toHaveBeenCalled()
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险关闭失败')
    expect(alert.text()).toContain('monitoring close trace storage unavailable')
  })

  it('archives monitoring situation close trace once before closing the package', async () => {
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValueOnce([{
      id: 'monitoring-situation-sf-001',
      sourceEventId: 'sf-001',
      title: 'CNC 现场态势升级处置包',
      source: '实时监控',
      workOrders: 'WO-RUSH-9001',
      priority: 'critical',
      owner: '生产经理审批',
      dueAt: '今日 11:30',
      auditId: 'AUD-SF-ESC-SF-001-20260521',
      traceId: 'TRACE-SF-ESC-SF-001',
      status: 'escalated',
      statusLabel: '待跨模块处置',
      scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
      scheduleAction: '冻结当前瓶颈任务并复核缺料窗口。',
      riskImpact: '现场态势已升级为跨模块处置包。',
      riskSuggestion: '风险队列升级给生产经理。',
      otdImpact: '+6%',
      delayImpact: '-1 单延期风险 / -4h 瓶颈等待',
      changeoverImpact: '+10min 可控',
      summary: '现场态势触发跨模块处置。',
      evidence: ['TRACE-SF-SF-001'],
      dispatchSteps: ['实时监控识别风险。'],
      createdAt: '2026-06-05T02:00:00.000Z',
    }])
    closeMonitoringSituationEscalation.mockReturnValueOnce({
      delayImpact: '-1 单延期风险已解除',
      riskSuggestion: '风险队列升级给生产经理。',
      closureTrace: '风险队列关闭现场处置包。',
      riskImpact: '现场态势已升级为跨模块处置包。',
      statusLabel: '已闭环',
      traceId: 'TRACE-SF-ESC-SF-001',
    })

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const monitoringCard = wrapper.get('.action-card')
    await monitoringCard.findAll('.card-actions button')[2].trigger('click')
    await flushPromises()

    expect(monitoringCard.get('.card-topline em').text()).toBe('已关闭')
    expect(appendRiskActionTrace).toHaveBeenCalledTimes(1)
    expect(closeMonitoringSituationEscalation).toHaveBeenCalledTimes(1)
    expect(appendRiskActionTrace.mock.invocationCallOrder[0]).toBeLessThan(
      closeMonitoringSituationEscalation.mock.invocationCallOrder[0],
    )
    expect(wrapper.text()).toContain('CNC 现场态势升级处置包 已关闭并反写实时监控处置包')
  })

  it('keeps monitoring situation packages escalated when realtime closure write fails after risk trace archival', async () => {
    readMonitoringSituationEscalationsBackendFirst.mockResolvedValueOnce([{
      id: 'monitoring-situation-sf-001',
      sourceEventId: 'sf-001',
      title: 'CNC 现场态势升级处置包',
      source: '实时监控',
      workOrders: 'WO-RUSH-9001',
      priority: 'critical',
      owner: '生产经理审批',
      dueAt: '今日 11:30',
      auditId: 'AUD-SF-ESC-SF-001-20260521',
      traceId: 'TRACE-SF-ESC-SF-001',
      status: 'escalated',
      statusLabel: '待跨模块处置',
      scheduleWindow: '锁定期后第一个 CNC 空窗 + 夜班复核',
      scheduleAction: '冻结当前瓶颈任务并复核缺料窗口。',
      riskImpact: '现场态势已升级为跨模块处置包。',
      riskSuggestion: '风险队列升级给生产经理。',
      otdImpact: '+6%',
      delayImpact: '-1 单延期风险 / -4h 瓶颈等待',
      changeoverImpact: '+10min 可控',
      summary: '现场态势触发跨模块处置。',
      evidence: ['TRACE-SF-SF-001'],
      dispatchSteps: ['实时监控识别风险。'],
      createdAt: '2026-06-05T02:00:00.000Z',
    }])
    closeMonitoringSituationEscalation.mockImplementationOnce(() => {
      throw new Error('monitoring closure write unavailable')
    })

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const monitoringCard = wrapper.get('.action-card')
    await monitoringCard.findAll('.card-actions button')[2].trigger('click')
    await flushPromises()

    expect(appendRiskActionTrace).toHaveBeenCalledTimes(1)
    expect(closeMonitoringSituationEscalation).toHaveBeenCalledTimes(1)
    expect(monitoringCard.get('.card-topline em').text()).toBe('已升级')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('现场态势处置包关闭失败')
    expect(alert.text()).toContain('monitoring closure write unavailable')
    expect(wrapper.text()).not.toContain('CNC 现场态势升级处置包 已关闭并反写实时监控处置包')
  })

  it('keeps base risk cards visible and alerts when anomaly dispatch risks fail to load', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('anomaly dispatch unavailable'))

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    expect(wrapper.findAll('.action-card')).toHaveLength(3)
    expect(wrapper.get('.action-card h4').text()).toBe('WO-2026-0042 CNC 停机延期')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('异常分流风险加载失败')
    expect(alert.text()).toContain('anomaly dispatch unavailable')
  })

  it('keeps all startup risk source failures visible instead of overwriting earlier alerts', async () => {
    readAnomalyDispatchRecordsBackendFirst.mockRejectedValueOnce(new Error('anomaly dispatch unavailable'))
    readAssistantRecoveryPackagesBackendFirst.mockRejectedValueOnce(new Error('assistant recovery unavailable'))

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    expect(wrapper.findAll('.action-card')).toHaveLength(3)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('异常分流风险加载失败')
    expect(alert.text()).toContain('anomaly dispatch unavailable')
    expect(alert.text()).toContain('助手执行包风险加载失败')
    expect(alert.text()).toContain('assistant recovery unavailable')
  })

  it('hydrates production anomaly events into the front of the risk queue', async () => {
    readProductionAnomalyEventBackendFirst.mockResolvedValueOnce({
      id: 'prod-anomaly-001',
      title: 'OP-20 装配扭矩异常',
      severity: 'Medium',
      workOrderNumber: 'WO-QA-2001',
      operationName: 'OP-20 装配',
      description: '扭矩漂移超过现场阈值。',
      suggestedAction: '暂停后续流转并触发质量复核。',
    })

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    expect(firstCard.classes()).toContain('warning')
    expect(firstCard.get('h4').text()).toBe('OP-20 装配扭矩异常')
    expect(firstCard.text()).toContain('生产异常')
    expect(firstCard.text()).toContain('影响工单：WO-QA-2001')
    expect(firstCard.text()).toContain('OP-20 装配 现场异常：扭矩漂移超过现场阈值。')
    expect(firstCard.text()).toContain('暂停后续流转并触发质量复核。')
    expect(wrapper.text()).toContain('OP-20 装配扭矩异常 已由生产报工异常上报自动进入风险处置队列。')
  })

  it('shows closed assistant recovery packages with purchase and quality responsibility notes', async () => {
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([{
      id: 'recovery-001',
      title: '急单恢复执行包',
      priority: 'critical',
      workOrders: 'WO-RUSH-9001 / WO-DEMO-1002',
      otdImpact: '+8%',
      delayImpact: '-1 单延期',
      purchaseActionSummary: '采购已完成 M-AL-6061 加急到货。',
      qualityActionSummary: '质量已完成首件复验。',
      riskSuggestion: '释放冻结工序并复核 CNC 分流。',
      owner: '生产经理审批',
      dueAt: '今日 17:00',
      status: 'closed',
      closureSummary: '执行交接已闭环。',
      riskImpact: '急单与缺料风险已进入复盘状态。',
      purchaseActionStatus: 'closed',
      purchaseActionTraceId: 'TRACE-PUR-CLOSED-001',
      qualityActionStatus: 'closed',
      qualityActionTraceId: 'TRACE-QUALITY-CLOSED-001',
    }])

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    expect(firstCard.classes()).toContain('closed')
    expect(firstCard.get('h4').text()).toBe('急单恢复执行包')
    expect(firstCard.text()).toContain('助手执行包')
    expect(firstCard.text()).toContain('已关闭')
    expect(firstCard.text()).toContain('急单与缺料风险已进入复盘状态。 执行交接已闭环。')
    expect(firstCard.get('.closure-note').text()).toContain('采购责任动作：采购已完成 M-AL-6061 加急到货。 TRACE-PUR-CLOSED-001')
    expect(firstCard.get('.closure-note').text()).toContain('质量责任动作：质量已完成首件复验。 TRACE-QUALITY-CLOSED-001')
    expect(wrapper.text()).toContain('急单恢复执行包 已由 AI 排产确认执行交接闭环')
  })

  it('keeps active assistant recovery quality-only packages escalated with quality evidence', async () => {
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([{
      id: 'recovery-quality-001',
      title: '质量复验恢复执行包',
      priority: 'warning',
      workOrders: 'WO-QA-2001',
      otdImpact: '+3%',
      delayImpact: '-4h 返工等待',
      purchaseActionSummary: '',
      qualityActionSummary: '质量复验通过后可恢复 OP-30。',
      riskSuggestion: '保留质量门并通知班组长。',
      owner: '质量主管',
      dueAt: '今日 15:00',
      status: 'open',
      closureSummary: '',
      riskImpact: '返工复验未完成会阻塞后续排产。',
      purchaseActionStatus: 'open',
      purchaseActionTraceId: '',
      qualityActionStatus: 'closed',
      qualityActionTraceId: 'TRACE-QUALITY-READY-001',
    }])

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    const firstCard = wrapper.get('.action-card')
    expect(firstCard.classes()).toContain('warning')
    expect(firstCard.get('.card-topline em').text()).toBe('已升级')
    expect(firstCard.text()).toContain('保留质量门并通知班组长。 质量复验通过后可恢复 OP-30。')
    expect(firstCard.text()).toContain('返工复验未完成会阻塞后续排产。 质量复验通过后可恢复 OP-30。')
    expect(firstCard.get('.closure-note').text()).toContain('质量责任动作：质量复验通过后可恢复 OP-30。 TRACE-QUALITY-READY-001')
    expect(wrapper.text()).toContain('质量复验恢复执行包 已由 AI 生产助手生成执行包，升级为跨模块风险处置项。')
  })

  it('keeps base risk cards visible and alerts when SLA review fails to load', async () => {
    readRiskSlaReviewRecordBackendFirst.mockRejectedValueOnce(new Error('sla review unavailable'))

    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    expect(wrapper.findAll('.action-card')).toHaveLength(3)
    expect(wrapper.get('.action-card h4').text()).toBe('WO-2026-0042 CNC 停机延期')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
    expect(alert.text()).toContain('风险 SLA 复核加载失败')
    expect(alert.text()).toContain('sla review unavailable')
  })

  it('fails loud and does not show a generated SLA review when review package persistence fails', async () => {
    writeRiskSlaReviewRecord.mockImplementationOnce(() => {
      throw new Error('risk sla review storage unavailable')
    })
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    await wrapper.get('.sla-review-buttons button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.sla-review-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('等待生成晨会复核包')
    expect(wrapper.text()).not.toContain('风险 SLA 逾期晨会复核包 已生成')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险 SLA 复核包生成失败')
    expect(alert.text()).toContain('risk sla review storage unavailable')
  })

  it('keeps the SLA review open when closure persistence fails', async () => {
    readRiskSlaReviewRecordBackendFirst.mockResolvedValueOnce({
      title: '风险 SLA 逾期晨会复核包',
      reviewMeetingId: 'RISK-SLA-20260601',
      auditId: 'AUD-RISK-SLA-001',
      status: 'escalated',
      statusLabel: '已升级晨会复核',
      summary: '风险 SLA 逾期晨会复核包已生成。',
      overdueCount: 1,
      criticalCount: 1,
      otdImpact: '-2 单延期风险待复核',
      risks: [],
      actions: [],
      traceId: 'TRACE-RISK-SLA-001',
    })
    closeRiskSlaReviewRecord.mockImplementationOnce(() => {
      throw new Error('risk sla closure storage unavailable')
    })
    const wrapper = mountRiskActionQueuePanel()
    await flushPromises()

    await wrapper.get('.sla-review-buttons button.secondary').trigger('click')
    await flushPromises()

    expect(wrapper.get('.sla-review-topline span').text()).toBe('已升级晨会复核')
    expect(wrapper.text()).not.toContain('责任动作已闭环')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('风险 SLA 复核闭环失败')
    expect(alert.text()).toContain('risk sla closure storage unavailable')
  })
})

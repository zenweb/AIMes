import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ScheduleRecoveryHandoffPanel from '../../src/components/schedule/ScheduleRecoveryHandoffPanel.vue'
import type { AssistantRecoveryPackage } from '../../src/utils/assistant-action-package-sync'

const recoveryPackage: AssistantRecoveryPackage = {
  id: 'recovery-1',
  title: 'WO-RUSH-9001 交期恢复执行包',
  auditCode: 'AUD-REC-001',
  traceId: 'TRACE-REC-001',
  actor: 'AI 生产助手',
  role: 'assistant',
  workOrders: 'WO-RUSH-9001',
  priority: 'critical',
  owner: '调度员 李工',
  dueAt: '今日 15:30',
  scheduleWindow: '锁定期后第一个 CNC 空窗',
  scheduleAction: '插入急单并保护锁定期',
  riskImpact: '急单延期风险',
  riskSuggestion: '跨模块复核',
  otdImpact: '+3.33pt',
  delayImpact: '-4 单',
  changeoverImpact: '+20min',
  status: 'active',
  statusLabel: '待跨模块复核',
  summary: '排产、采购、风险和质量责任动作需要交接闭环。',
  dispatchSteps: [
    {
      module: 'AI 排产',
      owner: '调度员 李工',
      action: '生成锁定期后插入建议',
      evidence: 'TRACE-SCH-RECOVERY',
      status: 'pending',
    },
    {
      module: '采购协同',
      owner: '采购 王工',
      action: '确认替代批次到料承诺',
      evidence: 'TRACE-PO-RECOVERY',
      status: 'closed',
      result: '替代批次已确认。',
    },
  ],
  createdAt: '2026-06-02T00:00:00.000Z',
}

describe('ScheduleRecoveryHandoffPanel', () => {
  it('announces the active recovery package and emits close requests', async () => {
    const wrapper = mount(ScheduleRecoveryHandoffPanel, {
      props: {
        packages: [recoveryPackage],
        activeSuggestion: {
          eventId: 'evt-assistant-recovery-recovery-1',
          title: '交期恢复闭环建议',
          action: '确认执行包交接',
          otdImpact: '+3.33pt',
          delayImpact: '-4 单',
          changeoverImpact: '+20min',
        },
        latestFeedback: {
          decision: 'accepted',
          decisionLabel: '已采纳',
          reasonCategory: 'event_agent',
          categoryLabel: '事件建议',
          reasonDetail: '同意交期恢复执行包。',
          createdAt: '2026-06-02T00:10:00.000Z',
        },
      },
    })

    const panel = wrapper.get('.recovery-handoff-panel')
    expect(panel.attributes('role')).toBe('status')
    expect(panel.attributes('aria-live')).toBe('polite')
    expect(panel.attributes('aria-label')).toBe('交期恢复执行包交接')
    expect(wrapper.text()).toContain('交期恢复闭环建议')
    expect(wrapper.text()).toContain('已采纳')

    await wrapper.get('.close-handoff').trigger('click')

    expect(wrapper.emitted('close-handoff')?.[0]).toEqual(['recovery-1'])
  })

  it('renders closed recovery evidence without allowing duplicate handoff closure', () => {
    const wrapper = mount(ScheduleRecoveryHandoffPanel, {
      props: {
        packages: [{
          ...recoveryPackage,
          status: 'closed',
          statusLabel: '交接已闭环',
          purchaseActionSummary: '采购已确认替代批次到货承诺。',
          purchaseActionAuditCode: 'AUD-PO-CLOSE-001',
          purchaseActionTraceId: 'TRACE-PO-CLOSE-001',
          qualityActionSummary: '质量已确认首件复核窗口。',
          qualityActionAuditCode: 'AUD-QA-CLOSE-001',
          qualityActionTraceId: 'TRACE-QA-CLOSE-001',
          closureSummary: '排产、采购、风险和质量责任动作均已闭合。',
          closureAuditCode: 'AUD-REC-CLOSE-001',
          closureTraceId: 'TRACE-REC-CLOSE-001',
          dispatchSteps: recoveryPackage.dispatchSteps.map(step => ({
            ...step,
            status: 'closed',
            result: step.result ?? `${step.module} 责任动作已闭合。`,
          })),
        }],
        activeSuggestion: null,
        latestFeedback: null,
      },
    })

    const text = wrapper.text()
    expect(text).toContain('交接已闭环')
    expect(text).toContain('采购已确认替代批次到货承诺')
    expect(text).toContain('AUD-PO-CLOSE-001 / TRACE-PO-CLOSE-001')
    expect(text).toContain('质量已确认首件复核窗口')
    expect(text).toContain('AUD-QA-CLOSE-001 / TRACE-QA-CLOSE-001')
    expect(text).toContain('排产、采购、风险和质量责任动作均已闭合')
    expect(text).toContain('AUD-REC-CLOSE-001')
    expect(wrapper.find('.close-handoff').exists()).toBe(false)
    expect(wrapper.emitted('close-handoff')).toBeUndefined()
  })

  it('shows waiting audit copy when the active recovery suggestion does not match the package', () => {
    const wrapper = mount(ScheduleRecoveryHandoffPanel, {
      props: {
        packages: [recoveryPackage],
        activeSuggestion: {
          eventId: 'evt-assistant-recovery-other-package',
          title: '其他执行包建议',
          action: '不应显示在当前包',
          otdImpact: '+1pt',
          delayImpact: '-1 单',
          changeoverImpact: '+5min',
        },
        latestFeedback: null,
      },
    })

    const text = wrapper.text()
    expect(text).toContain('等待排产复核')
    expect(text).toContain('等待调度员在事件队列生成重排建议')
    expect(text).toContain('等待采纳 / 调整原因')
    expect(text).not.toContain('其他执行包建议')
  })

  it('renders nothing when there is no recovery package to hand off', () => {
    const wrapper = mount(ScheduleRecoveryHandoffPanel, {
      props: {
        packages: [],
        activeSuggestion: null,
        latestFeedback: null,
      },
    })

    expect(wrapper.find('.recovery-handoff-panel').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })
})

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminBoard from '../../src/components/admin/AdminBoard.vue'

const routerPush = vi.hoisted(() => vi.fn())
const getUsers = vi.hoisted(() => vi.fn())
const createUser = vi.hoisted(() => vi.fn())
const updateUser = vi.hoisted(() => vi.fn())
const getConfigs = vi.hoisted(() => vi.fn())
const updateConfig = vi.hoisted(() => vi.fn())
const getNotificationConfigs = vi.hoisted(() => vi.fn())
const updateNotificationConfig = vi.hoisted(() => vi.fn())
const readAgentConfigApprovalsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const decideAgentConfigApproval = vi.hoisted(() => vi.fn())
const isApprovalOpen = vi.hoisted(() => vi.fn((status: string) => status === 'pending' || status === 'reviewing'))
const buildQualityKnowledgeGrayReleaseMonitorRecords = vi.hoisted(() => vi.fn(() => []))
const decideQualityKnowledgeGrayRelease = vi.hoisted(() => vi.fn())
const approveQualityKnowledgeGrayReleaseExpansion = vi.hoisted(() => vi.fn())
const closeQualityKnowledgeGrayReviewIssueWithNegativeSample = vi.hoisted(() => vi.fn())
const reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment = vi.hoisted(() => vi.fn())
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../../src/api/admin', () => ({
  getUsers,
  createUser,
  updateUser,
  getConfigs,
  updateConfig,
  getNotificationConfigs,
  updateNotificationConfig,
}))

vi.mock('../../src/api/llm', () => ({
  getLlmStatus: vi.fn(async () => ({ provider: 'OpenAI', model: 'gpt-5', reachable: true })),
  getLlmConfig: vi.fn(async () => ({ provider: 'OpenAI', model: 'gpt-5' })),
}))

vi.mock('../../src/utils/assistant-action-audit', () => ({
  readAssistantActionAuditsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  readAssistantRecoveryPackagesBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/poc-evidence-governance', () => ({
  readPocEvidenceGovernanceRecordsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/agent-config-approval-sync', () => ({
  approvalStatusLabel: vi.fn((status: string) => status),
  decideAgentConfigApproval,
  isApprovalOpen,
  readAgentConfigApprovalsBackendFirst,
  readQualityExperimentExpansionGatePolicy: vi.fn(() => ({
    policyLabel: '等待质量实验证据',
  })),
}))

vi.mock('../../src/utils/poc-review-signoff-sync', () => ({
  readPocReviewSignoffRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/poc-rollout-package-sync', () => ({
  readPocRolloutPackageRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/risk-sla-review-sync', () => ({
  readRiskSlaReviewRecordBackendFirst: vi.fn(async () => null),
}))

vi.mock('../../src/utils/quality-rework-sync', () => ({
  readQualityReworkImpact: vi.fn(() => null),
}))

vi.mock('../../src/utils/quality-mrb-disposition-sync', () => ({
  readQualityMrbDispositionRecord: vi.fn(() => null),
}))

vi.mock('../../src/utils/outsourcing-commitment-sync', () => ({
  readOutsourcingCommitmentPackages: vi.fn(() => []),
}))

vi.mock('../../src/utils/otd-evidence-chain-sync', () => ({
  readOtdEvidenceChainRecords: vi.fn(() => []),
}))

vi.mock('../../src/utils/anomaly-dispatch-sync', () => ({
  readAnomalyDispatchRecordsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/labor-assignment-sync', () => ({
  readLaborQualificationBlocksBackendFirst: vi.fn(async () => []),
  readLaborReassignmentsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/engineering-change-sync', () => ({
  readEngineeringChangeImpactAnalysis: vi.fn(() => null),
  readRouteCapabilityValidation: vi.fn(() => null),
}))

vi.mock('../../src/utils/knowledge-governance-sync', () => ({
  readKnowledgeGovernancePendingDocuments: vi.fn(() => []),
  readKnowledgeGovernanceReviewsBackendFirst: vi.fn(async () => []),
}))

vi.mock('../../src/utils/quality-knowledge-sample-sync', () => ({
  approveQualityKnowledgeGrayReleaseExpansion,
  buildQualityKnowledgeRecommendationFeedbackGovernanceRecords: vi.fn(() => []),
  buildQualityKnowledgeRecommendationExperimentCandidateRecords: vi.fn(() => []),
  buildQualityKnowledgeRecommendationExperimentComparisonRecords: vi.fn(() => []),
  buildQualityKnowledgeGrayReleaseMonitorRecords,
  buildQualityKnowledgePolicyGovernanceRecords: vi.fn(() => []),
  buildQualityKnowledgeRetrainingGovernanceRecords: vi.fn(() => []),
  closeQualityKnowledgeGrayReviewIssueWithNegativeSample,
  decideQualityKnowledgeGrayRelease,
  isQualityKnowledgeGrayRepublishEvidence: vi.fn(() => false),
  readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst,
  readQualityKnowledgeRecommendationFeedbackRecordsBackendFirst: vi.fn(async () => []),
  readQualityKnowledgeReviewQueueRecordsBackendFirst: vi.fn(async () => []),
  readQualityKnowledgeRetrainingVersionRecordsBackendFirst: vi.fn(async () => []),
  reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment,
}))

function mountAdminBoard() {
  return mount(AdminBoard)
}

describe('AdminBoard', () => {
  beforeEach(() => {
    routerPush.mockReset()
    getUsers.mockResolvedValue({ items: [], totalCount: 0 })
    createUser.mockResolvedValue({})
    updateUser.mockResolvedValue({})
    getConfigs.mockResolvedValue([])
    updateConfig.mockResolvedValue({})
    getNotificationConfigs.mockResolvedValue([])
    updateNotificationConfig.mockResolvedValue({})
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([])
    decideAgentConfigApproval.mockReset()
    isApprovalOpen.mockReset()
    isApprovalOpen.mockImplementation((status: string) => status === 'pending' || status === 'reviewing')
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReset()
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([])
    decideQualityKnowledgeGrayRelease.mockReset()
    approveQualityKnowledgeGrayReleaseExpansion.mockReset()
    closeQualityKnowledgeGrayReviewIssueWithNegativeSample.mockReset()
    reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment.mockReset()
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockReset()
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValue([])
  })

  it('exposes admin sections as accessible tabs with the current section selected', async () => {
    const wrapper = mountAdminBoard()
    await flushPromises()

    const tablist = wrapper.get('[role="tablist"]')
    const tabs = tablist.findAll('[role="tab"]')
    expect(tabs.map(tab => tab.text())).toEqual([
      '用户管理',
      '角色权限',
      '系统配置',
      '通知配置',
      'Agent 治理',
      'LLM 设置',
    ])
    expect(tabs[0].attributes('aria-selected')).toBe('true')

    await tabs[2].trigger('click')
    await flushPromises()

    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[2].attributes('aria-selected')).toBe('true')
  })

  it('keeps create dialog open and does not add a local user when create api fails', async () => {
    createUser.mockRejectedValueOnce(new Error('admin create user API unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[0].setValue('qa-admin')
    await inputs[1].setValue('QA Admin')
    await inputs[2].setValue('Temp#12345')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      username: 'qa-admin',
      displayName: 'QA Admin',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('qa-admin')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('用户创建失败')
    expect(alert.text()).toContain('admin create user API unavailable')
  })

  it('refreshes users from backend authority after creating a user', async () => {
    getUsers
      .mockResolvedValueOnce({ items: [], totalCount: 0 })
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-002',
          username: 'qa-admin',
          displayName: 'QA Admin Persisted',
          role: 'Admin',
          isActive: true,
          mustChangePassword: true,
          createdAt: '2026-06-06T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[0].setValue('qa-admin')
    await inputs[1].setValue('QA Admin Draft')
    await inputs[2].setValue('Temp#12345')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      username: 'qa-admin',
      displayName: 'QA Admin Draft',
    }))
    expect(getUsers).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('qa-admin')
    expect(wrapper.text()).toContain('QA Admin Persisted')
    expect(wrapper.text()).not.toContain('QA Admin Draft')
  })

  it('keeps edit dialog open and does not locally update a user when update api fails', async () => {
    getUsers.mockResolvedValueOnce({
      items: [{
        id: 'admin-001',
        username: 'admin',
        displayName: '系统管理员',
        role: 'Admin',
        isActive: true,
        mustChangePassword: false,
        createdAt: '2026-01-01T00:00:00',
        lastLoginAt: null,
      }],
      totalCount: 1,
    })
    updateUser.mockRejectedValueOnce(new Error('admin update user API unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm').trigger('click')
    const input = wrapper.get<HTMLInputElement>('.modal-content input.form-input:not([disabled])')
    await input.setValue('未持久化管理员')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-001', expect.objectContaining({
      displayName: '未持久化管理员',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('系统管理员')
    expect(wrapper.text()).not.toContain('未持久化管理员')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('用户资料保存失败')
    expect(alert.text()).toContain('admin update user API unavailable')
  })

  it('refreshes users from backend authority after editing a user', async () => {
    getUsers
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'admin',
          displayName: '系统管理员',
          role: 'Admin',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'admin',
          displayName: '后端确认管理员',
          role: 'Engineer',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm').trigger('click')
    const input = wrapper.get<HTMLInputElement>('.modal-content input.form-input:not([disabled])')
    await input.setValue('本地编辑管理员')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-001', expect.objectContaining({
      displayName: '本地编辑管理员',
    }))
    expect(getUsers).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('后端确认管理员')
    expect(wrapper.text()).toContain('工程师')
    expect(wrapper.text()).not.toContain('本地编辑管理员')
  })

  it('does not locally toggle a user when active status update api fails', async () => {
    getUsers.mockResolvedValueOnce({
      items: [{
        id: 'admin-001',
        username: 'admin',
        displayName: '系统管理员',
        role: 'Admin',
        isActive: true,
        mustChangePassword: false,
        createdAt: '2026-01-01T00:00:00',
        lastLoginAt: null,
      }],
      totalCount: 1,
    })
    updateUser.mockRejectedValueOnce(new Error('admin active status API unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm.danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-001', { isActive: false })
    const rowCells = wrapper.get('tbody tr').findAll('td')
    expect(rowCells[3].text()).toBe('启用')
    expect(rowCells[6].text()).toContain('禁用')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('用户启停失败')
    expect(alert.text()).toContain('admin active status API unavailable')
  })

  it('refreshes users from backend authority after toggling active status', async () => {
    getUsers
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'admin',
          displayName: '系统管理员',
          role: 'Admin',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'admin',
          displayName: '系统管理员',
          role: 'Admin',
          isActive: false,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm.danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-001', { isActive: false })
    expect(getUsers).toHaveBeenCalledTimes(2)
    const rowCells = wrapper.get('tbody tr').findAll('td')
    expect(rowCells[3].text()).toBe('禁用')
    expect(rowCells[6].text()).toContain('启用')
  })

  it('fails loud when user save succeeds but backend refresh fails', async () => {
    getUsers
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'admin',
          displayName: '系统管理员',
          role: 'Admin',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
      .mockRejectedValueOnce(new Error('admin user refresh unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm.danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-001', { isActive: false })
    const rowCells = wrapper.get('tbody tr').findAll('td')
    expect(rowCells[3].text()).toBe('启用')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('用户列表刷新失败')
    expect(alert.text()).toContain('admin user refresh unavailable')
  })

  it('shows a retryable alert when system config save api fails', async () => {
    getConfigs.mockResolvedValueOnce([{
      id: 'cfg-001',
      configKey: 'security.sessionTimeoutMinutes',
      configValue: '30',
      description: '会话超时分钟数',
      category: 'general',
      updatedAt: '2026-01-01T00:00:00',
      updatedBy: 'admin',
    }])
    updateConfig.mockRejectedValueOnce(new Error('admin config save API unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    await flushPromises()
    await wrapper.get<HTMLInputElement>('.config-input').setValue('45')
    await wrapper.get('.config-edit .btn-sm').trigger('click')
    await flushPromises()

    expect(updateConfig).toHaveBeenCalledWith('cfg-001', {
      configValue: '45',
      updatedBy: 'admin',
    })
    expect(wrapper.get<HTMLInputElement>('.config-input').element.value).toBe('45')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('系统配置保存失败')
    expect(alert.text()).toContain('admin config save API unavailable')
  })

  it('does not locally toggle notification config when save api fails', async () => {
    getNotificationConfigs.mockResolvedValueOnce([{
      id: 'notif-001',
      category: 'production',
      label: '生产异常',
      enabled: true,
      description: '生产异常实时通知',
    }])
    updateNotificationConfig.mockRejectedValueOnce(new Error('admin notification save API unavailable'))
    const wrapper = mountAdminBoard()
    await flushPromises()

    const tabs = wrapper.findAll('[role="tab"]')
    await tabs[3].trigger('click')
    await flushPromises()
    await wrapper.get<HTMLInputElement>('input[type="checkbox"]').setValue(false)
    await flushPromises()
    await tabs[0].trigger('click')
    await flushPromises()
    await tabs[3].trigger('click')
    await flushPromises()

    expect(updateNotificationConfig).toHaveBeenCalledWith('notif-001', { enabled: false })
    expect(wrapper.get<HTMLInputElement>('input[type="checkbox"]').element.checked).toBe(true)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('通知配置保存失败')
    expect(alert.text()).toContain('admin notification save API unavailable')
  })

  it('fails loud when agent config approval decision cannot be written', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValueOnce([{
      id: 'cfg-quality-experiment-gate',
      title: '质量推荐实验扩大门禁',
      replayTitle: '质量推荐实验扩大门禁复验通过率从 100% 调整为 95%',
      configKey: 'QualityRecommendation.ExperimentExpansionGate',
      fromValue: '100%',
      toValue: '95%',
      reason: 'R4 同设备族实验复验 98%，申请扩大灰度。',
      owner: '质量主管审批',
      status: 'pending',
      auditId: 'TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001',
      submittedBy: 'admin',
      submittedAt: '2026-05-21T18:30:00.000Z',
      risk: '扩大灰度可能引入负样本误召回。',
    }])
    decideAgentConfigApproval.mockImplementationOnce(() => {
      throw new Error('approval storage unavailable')
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    const approvalRow = wrapper.findAll('.approval-row')
      .find(row => row.text().includes('质量推荐实验扩大门禁'))
    expect(approvalRow).toBeDefined()
    await approvalRow!.find('.btn-sm.approve').trigger('click')
    await flushPromises()

    expect(decideAgentConfigApproval).toHaveBeenCalledWith('cfg-quality-experiment-gate', 'approved', 'admin')
    expect(readAgentConfigApprovalsBackendFirst).toHaveBeenCalledTimes(1)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('关键配置审批失败')
    expect(alert.text()).toContain('approval storage unavailable')
    expect(approvalRow!.text()).toContain('pending')
  })

  it('fails loud when quality gray release decision cannot be written', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValueOnce([{
      id: 'gray-r3-wo-001-op-10',
      title: 'R3 质量推荐灰度',
      summary: '复验通过率达标，等待质量主管扩大灰度。',
      scopeLabel: 'WO-001 / OP-10',
      statusClass: 'guarded',
      statusLabel: '等待决策',
      metrics: [
        { label: '采纳率', value: '86%', statusClass: 'accepted' },
      ],
      versionLabel: 'R3',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      negativeSampleLabel: '负样本 0 误召回',
      auditId: 'AUDIT-GRAY-R3-001',
      traceId: 'TRACE-GRAY-R3-001',
    }])
    decideQualityKnowledgeGrayRelease.mockImplementationOnce(() => {
      throw new Error('gray decision storage unavailable')
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    const grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    await grayCard!.find('.gray-decision-actions .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(decideQualityKnowledgeGrayRelease).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'gray-r3-wo-001-op-10' }),
      'expanded',
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(1)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量推荐灰度决策失败')
    expect(alert.text()).toContain('gray decision storage unavailable')
    expect(grayCard!.text()).toContain('扩大灰度')
  })

  it('fails loud when quality gray release expansion approval cannot be written', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValueOnce([{
      id: 'gray-r3-wo-001-op-10',
      title: 'R3 质量推荐灰度',
      summary: '质量主管确认后才能扩大范围。',
      scopeLabel: 'WO-001 / OP-10',
      statusClass: 'guarded',
      statusLabel: '等待质量主管确认',
      metrics: [
        { label: '复验通过率', value: '98%', statusClass: 'accepted' },
      ],
      versionLabel: 'R3',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      negativeSampleLabel: '负样本 0 误召回',
      auditId: 'AUDIT-GRAY-R3-001',
      traceId: 'TRACE-GRAY-R3-001',
    }])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce([{
      id: 'decision-r3-expanded',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      decision: 'expanded',
      decisionLabel: '扩大灰度',
      approvalStatus: 'pending',
      approvalLabel: '等待质量主管确认',
      statusClass: 'guarded',
      auditId: 'AUDIT-GRAY-DECISION-R3-001',
      traceId: 'TRACE-GRAY-DECISION-R3-001',
    }])
    approveQualityKnowledgeGrayReleaseExpansion.mockImplementationOnce(() => {
      throw new Error('gray expansion approval storage unavailable')
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    const grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    await grayCard!.find('.gray-decision-result .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(approveQualityKnowledgeGrayReleaseExpansion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'decision-r3-expanded' }),
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(1)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量推荐灰度扩大确认失败')
    expect(alert.text()).toContain('gray expansion approval storage unavailable')
    expect(grayCard!.text()).toContain('质量主管确认扩大')
  })

  it('fails loud when quality gray review issue close cannot be written', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValueOnce([{
      id: 'gray-r3-wo-001-op-10',
      title: 'R3 质量推荐灰度',
      summary: '回滚后等待补充负样本关闭问题单。',
      scopeLabel: 'WO-001 / OP-10',
      statusClass: 'guarded',
      statusLabel: '待复核',
      metrics: [
        { label: '误召回', value: '2', statusClass: 'guarded' },
      ],
      versionLabel: 'R3',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      negativeSampleLabel: '待补充负样本',
      auditId: 'AUDIT-GRAY-R3-ROLLBACK-001',
      traceId: 'TRACE-GRAY-R3-ROLLBACK-001',
    }])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce([{
      id: 'decision-r3-rolled-back',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      decision: 'rolled_back',
      decisionLabel: '回滚到 R2',
      approvalStatus: 'approved',
      approvalLabel: '已回滚',
      statusClass: 'guarded',
      auditId: 'AUDIT-GRAY-DECISION-R3-ROLLBACK-001',
      traceId: 'TRACE-GRAY-DECISION-R3-ROLLBACK-001',
      reviewIssueId: 'GRAY-ISSUE-R3-001',
      reviewIssueStatus: 'open',
      reviewIssueLabel: '待补充负样本',
      reviewIssueTraceId: 'TRACE-GRAY-ISSUE-R3-001',
    }])
    closeQualityKnowledgeGrayReviewIssueWithNegativeSample.mockImplementationOnce(() => {
      throw new Error('gray review issue close storage unavailable')
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    const grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    await grayCard!.find('.gray-decision-result .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(closeQualityKnowledgeGrayReviewIssueWithNegativeSample).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'decision-r3-rolled-back' }),
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(1)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量灰度复核问题单关闭失败')
    expect(alert.text()).toContain('gray review issue close storage unavailable')
    expect(grayCard!.text()).toContain('补充负样本并关闭')
  })

  it('fails loud when quality gray prevalidation reopen cannot be written', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValueOnce([{
      id: 'gray-r3-wo-001-op-10',
      title: 'R3 质量推荐灰度',
      summary: '回滚后等待调整范围重开校验。',
      scopeLabel: 'WO-001 / OP-10',
      statusClass: 'guarded',
      statusLabel: '待复核',
      metrics: [
        { label: '误召回', value: '2', statusClass: 'guarded' },
      ],
      versionLabel: 'R3',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      negativeSampleLabel: '待调整范围',
      auditId: 'AUDIT-GRAY-R3-ROLLBACK-001',
      traceId: 'TRACE-GRAY-R3-ROLLBACK-001',
    }])
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst.mockResolvedValueOnce([{
      id: 'decision-r3-rolled-back',
      trainingSetVersion: 'R3',
      targetWorkOrderId: 'WO-001',
      operationCode: 'OP-10',
      releaseCycleLabel: '2026-W23',
      decision: 'rolled_back',
      decisionLabel: '回滚到 R2',
      approvalStatus: 'approved',
      approvalLabel: '已回滚',
      statusClass: 'guarded',
      auditId: 'AUDIT-GRAY-DECISION-R3-ROLLBACK-001',
      traceId: 'TRACE-GRAY-DECISION-R3-ROLLBACK-001',
      reviewIssueId: 'GRAY-ISSUE-R3-001',
      reviewIssueStatus: 'open',
      reviewIssueLabel: '待调整范围',
      reviewIssueTraceId: 'TRACE-GRAY-ISSUE-R3-001',
    }])
    reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment.mockImplementationOnce(() => {
      throw new Error('gray prevalidation reopen storage unavailable')
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    const grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    const reviewButtons = grayCard!.findAll('.gray-decision-result .btn-sm')
    await reviewButtons[1].trigger('click')
    await flushPromises()

    expect(reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'decision-r3-rolled-back' }),
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(1)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量灰度前置校验重开失败')
    expect(alert.text()).toContain('gray prevalidation reopen storage unavailable')
    expect(grayCard!.text()).toContain('调整范围重开校验')
  })
})

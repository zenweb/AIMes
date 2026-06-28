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
const getLlmStatus = vi.hoisted(() => vi.fn(async () => ({ provider: 'OpenAI', model: 'gpt-5', reachable: true })))
const getLlmConfig = vi.hoisted(() => vi.fn(async () => ({ provider: 'OpenAI', model: 'gpt-5' })))
const readAssistantActionAuditsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readAssistantRecoveryPackagesBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readAgentConfigApprovalsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readPocEvidenceGovernanceRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readPocReviewSignoffRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const readPocRolloutPackageRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const readPocPilotRunRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const readPocHypercareAcceptanceRecordBackendFirst = vi.hoisted(() => vi.fn(async () => null))
const decideAgentConfigApproval = vi.hoisted(() => vi.fn())
const isApprovalOpen = vi.hoisted(() => vi.fn((status: string) => status === 'pending' || status === 'reviewing'))
const buildQualityKnowledgeGrayReleaseMonitorRecords = vi.hoisted(() => vi.fn(() => []))
const decideQualityKnowledgeGrayRelease = vi.hoisted(() => vi.fn())
const approveQualityKnowledgeGrayReleaseExpansion = vi.hoisted(() => vi.fn())
const closeQualityKnowledgeGrayReviewIssueWithNegativeSample = vi.hoisted(() => vi.fn())
const reopenQualityKnowledgeGrayPrevalidationWithScopeAdjustment = vi.hoisted(() => vi.fn())
const readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readLaborQualificationBlocksBackendFirst = vi.hoisted(() => vi.fn(async () => []))
const readLaborReassignmentsBackendFirst = vi.hoisted(() => vi.fn(async () => []))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
  useRoute: () => ({ query: {} }),
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
  getLlmStatus,
  getLlmConfig,
}))

vi.mock('../../src/utils/assistant-action-audit', () => ({
  readAssistantActionAuditsBackendFirst,
}))

vi.mock('../../src/utils/assistant-action-package-sync', () => ({
  readAssistantRecoveryPackagesBackendFirst,
}))

vi.mock('../../src/utils/poc-evidence-governance', () => ({
  readPocEvidenceGovernanceRecordsBackendFirst,
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
  readPocReviewSignoffRecordBackendFirst,
}))

vi.mock('../../src/utils/poc-rollout-package-sync', () => ({
  readPocRolloutPackageRecordBackendFirst,
}))

vi.mock('../../src/utils/poc-pilot-run-sync', () => ({
  readPocPilotRunRecordBackendFirst,
}))

vi.mock('../../src/utils/poc-hypercare-sync', () => ({
  readPocHypercareAcceptanceRecordBackendFirst,
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
  readLaborQualificationBlocksBackendFirst,
  readLaborReassignmentsBackendFirst,
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
    getLlmStatus.mockReset()
    getLlmStatus.mockResolvedValue({ provider: 'OpenAI', model: 'gpt-5', reachable: true })
    getLlmConfig.mockReset()
    getLlmConfig.mockResolvedValue({ provider: 'OpenAI', model: 'gpt-5' })
    readAssistantActionAuditsBackendFirst.mockReset()
    readAssistantActionAuditsBackendFirst.mockResolvedValue([])
    readAssistantRecoveryPackagesBackendFirst.mockReset()
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValue([])
    readAgentConfigApprovalsBackendFirst.mockResolvedValue([])
    readPocEvidenceGovernanceRecordsBackendFirst.mockReset()
    readPocEvidenceGovernanceRecordsBackendFirst.mockResolvedValue([])
    readPocReviewSignoffRecordBackendFirst.mockReset()
    readPocReviewSignoffRecordBackendFirst.mockResolvedValue(null)
    readPocRolloutPackageRecordBackendFirst.mockReset()
    readPocRolloutPackageRecordBackendFirst.mockResolvedValue(null)
    readPocPilotRunRecordBackendFirst.mockReset()
    readPocPilotRunRecordBackendFirst.mockResolvedValue(null)
    readPocHypercareAcceptanceRecordBackendFirst.mockReset()
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValue(null)
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
    readLaborQualificationBlocksBackendFirst.mockReset()
    readLaborQualificationBlocksBackendFirst.mockResolvedValue([])
    readLaborReassignmentsBackendFirst.mockReset()
    readLaborReassignmentsBackendFirst.mockResolvedValue([])
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

  it('guides system administrators with bilingual governance links before high-risk changes', async () => {
    const wrapper = mountAdminBoard()
    await flushPromises()

    const guidance = wrapper.get('.admin-guidance')
    expect(guidance.text()).toContain('系统管理操作前请确认角色、审计编号和回滚路径')
    expect(guidance.text()).toContain('Before admin changes, confirm role scope, audit ID, and rollback path.')

    const links = guidance.findAll('a').map(link => ({
      text: link.text(),
      href: link.attributes('href'),
    }))
    expect(links).toEqual([
      { text: '审计回放', href: '/scheduling/audit-logs' },
      { text: '文档治理', href: '/scheduling/knowledge/documents' },
      { text: '帮助：系统治理支持', href: '#admin-governance-help' },
    ])

    const help = wrapper.get('#admin-governance-help')
    expect(help.text()).toContain('先确认影响范围，再保存配置或调整权限。')
    expect(help.text()).toContain('Confirm impact scope before saving configuration or changing access.')
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

  it('clears abandoned create-user drafts when the dialog is cancelled', async () => {
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    let inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[0].setValue('qa-admin')
    await inputs[1].setValue('QA Admin Draft')
    await inputs[2].setValue('Temp#12345')
    await wrapper.get<HTMLSelectElement>('.modal-content select.form-input').setValue('Admin')

    await wrapper.get('.modal-content .btn-cancel').trigger('click')
    await flushPromises()
    await wrapper.get('.btn-add').trigger('click')
    inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')

    expect(inputs[0].element.value).toBe('')
    expect(inputs[1].element.value).toBe('')
    expect(inputs[2].element.value).toBe('')
    expect(wrapper.get<HTMLSelectElement>('.modal-content select.form-input').element.value).toBe('Operator')
  })

  it('shows bilingual guidance and help inside the create-user dialog before adding an account', async () => {
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')

    const guidance = wrapper.get('.modal-content .modal-guidance')
    expect(guidance.text()).toContain('创建账号前请确认角色范围、初始密码交付方式和审计留痕。')
    expect(guidance.text()).toContain('Before creating an account, confirm role scope, password handoff, and audit trail.')
    const helpLink = guidance.get('a')
    expect(helpLink.text()).toBe('帮助：系统治理支持')
    expect(helpLink.attributes('href')).toBe('#admin-governance-help')
  })

  it('shows bilingual guidance and help inside the edit-user dialog before changing access', async () => {
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
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get('.data-table .btn-sm').trigger('click')

    const guidance = wrapper.get('.modal-content .modal-guidance')
    expect(guidance.text()).toContain('保存用户变更前请确认权限影响、责任人和回滚路径。')
    expect(guidance.text()).toContain('Before saving user changes, confirm access impact, owner, and rollback path.')
    const helpLink = guidance.get('a')
    expect(helpLink.text()).toBe('帮助：系统治理支持')
    expect(helpLink.attributes('href')).toBe('#admin-governance-help')
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

  it('matches user search case-insensitively across username and display name', async () => {
    getUsers.mockResolvedValueOnce({
      items: [
        {
          id: 'admin-001',
          username: 'operator01',
          displayName: '一线操作员',
          role: 'Operator',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        },
        {
          id: 'admin-002',
          username: 'lead01',
          displayName: 'QA Lead',
          role: 'Lead',
          isActive: true,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        },
      ],
      totalCount: 2,
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.get<HTMLInputElement>('.search-input').setValue('qa')
    await flushPromises()

    expect(wrapper.text()).toContain('QA Lead')
    expect(wrapper.text()).not.toContain('一线操作员')
  })

  it('keeps refreshed user lists visible when backend results shrink below the current page', async () => {
    const manyUsers = Array.from({ length: 16 }, (_, index) => ({
      id: `admin-${String(index + 1).padStart(3, '0')}`,
      username: `user${index + 1}`,
      displayName: `用户 ${index + 1}`,
      role: 'Operator',
      isActive: true,
      mustChangePassword: false,
      createdAt: '2026-01-01T00:00:00',
      lastLoginAt: null,
    }))
    getUsers
      .mockResolvedValueOnce({ items: manyUsers, totalCount: 16 })
      .mockResolvedValueOnce({
        items: [{
          id: 'admin-001',
          username: 'user1',
          displayName: '后端保留用户',
          role: 'Operator',
          isActive: false,
          mustChangePassword: false,
          createdAt: '2026-01-01T00:00:00',
          lastLoginAt: null,
        }],
        totalCount: 1,
      })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('.page-btn').find(button => button.text() === '2')!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('用户 16')

    await wrapper.get('.data-table .btn-sm.danger').trigger('click')
    await flushPromises()

    expect(updateUser).toHaveBeenCalledWith('admin-016', { isActive: false })
    expect(wrapper.text()).toContain('后端保留用户')
    expect(wrapper.text()).not.toContain('用户 16')
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

  it('aggregates startup config fallback failures with governance evidence failures', async () => {
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(new Error('approval startup unavailable'))
    getConfigs.mockRejectedValueOnce(new Error('admin config startup unavailable'))
    getNotificationConfigs.mockRejectedValueOnce(new Error('admin notification startup unavailable'))

    const wrapper = mountAdminBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('部分管理数据刷新失败')
    expect(alert.text()).toContain('Agent 配置审批：approval startup unavailable')
    expect(alert.text()).toContain('系统配置：admin config startup unavailable')
    expect(alert.text()).toContain('通知配置：admin notification startup unavailable')
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('site.name')
    await wrapper.findAll('[role="tab"]')[3].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('设备状态')
  })

  it('keeps admin startup fallbacks quiet when offline demo skips config and notification backend reads', async () => {
    const configError = new Error('Offline demo mode skipped backend request: /api/v1/admin/configs')
    configError.name = 'OfflineDemoApiError'
    const notificationError = new Error('Offline demo mode skipped backend request: /api/v1/admin/notifications')
    notificationError.name = 'OfflineDemoApiError'
    const approvalError = new Error('Offline demo mode skipped backend request: /api/v1/scheduling/agent-config-approvals')
    approvalError.name = 'OfflineDemoApiError'
    readAgentConfigApprovalsBackendFirst.mockRejectedValueOnce(approvalError)
    getConfigs.mockRejectedValueOnce(configError)
    getNotificationConfigs.mockRejectedValueOnce(notificationError)

    const wrapper = mountAdminBoard()
    await flushPromises()

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('site.name')
    await wrapper.findAll('[role="tab"]')[3].trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('设备状态')
  })

  it('fails loud when llm status cannot be loaded', async () => {
    getLlmStatus.mockRejectedValueOnce(new Error('llm status endpoint unavailable'))

    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[5].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('未连接')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('LLM 状态加载失败')
    expect(alert.text()).toContain('llm status endpoint unavailable')
  })

  it('fails loud and keeps agent governance usable when approval startup payload is not an array', async () => {
    readAgentConfigApprovalsBackendFirst.mockResolvedValueOnce({ items: [] })

    const wrapper = mountAdminBoard()
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('部分管理数据刷新失败')
    expect(alert.text()).toContain('Agent 配置审批：后端返回非数组审计载荷')

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Agent 策略与权限治理')
    expect(wrapper.text()).toContain('配置审批中')
    const approvalRows = wrapper.findAll('.approval-row')
    expect(approvalRows).toHaveLength(0)
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

  it('renders assistant action and recovery package governance with audit routes', async () => {
    readAssistantActionAuditsBackendFirst.mockResolvedValueOnce([
      {
        id: 'action-equipment-downtime',
        type: 'equipment_downtime_package',
        label: '生成设备停机恢复包',
        resultMessage: '已锁定风险、采购与质量责任动作。',
        actor: 'admin',
        role: 'Admin',
        permitted: true,
        targetRoute: '/equipment',
        auditCode: 'AUDIT-ACTION-EQ-001',
        traceId: 'TRACE-ACTION-EQ-001',
        createdAt: '2026-06-15T08:30:00.000Z',
      },
      {
        id: 'action-export-denied',
        type: 'export_report',
        label: '导出经营报表',
        resultMessage: '当前角色缺少导出权限。',
        actor: 'lead01',
        role: 'Lead',
        permitted: false,
        targetRoute: '',
        auditCode: 'AUDIT-ACTION-EXPORT-001',
        createdAt: '2026-06-15T08:35:00.000Z',
      },
    ])
    readAssistantRecoveryPackagesBackendFirst.mockResolvedValueOnce([
      {
        id: 'pkg-closed',
        owner: '计划主管',
        status: 'closed',
        statusLabel: '已闭合',
        title: '交期恢复执行包 A',
        summary: '排产、采购、质量责任动作均已闭合。',
        workOrders: 'WO-001',
        auditCode: 'AUDIT-PKG-001',
        traceId: 'TRACE-PKG-001',
        closureTraceId: 'TRACE-PKG-CLOSE-001',
        purchaseActionSummary: '供应商到料承诺已确认',
        purchaseActionTraceId: 'TRACE-PUR-001',
        qualityActionSummary: '质量复验已完成',
        qualityActionTraceId: 'TRACE-QA-001',
        dispatchSteps: [
          { module: '排产', owner: '计划主管', status: 'closed', evidence: 'EV-SCH-001' },
        ],
      },
      {
        id: 'pkg-partial',
        owner: '采购主管',
        status: 'active',
        statusLabel: '责任动作处理中',
        title: '交期恢复执行包 B',
        summary: '采购责任动作已闭合，质量仍在复核。',
        workOrders: 'WO-002',
        auditCode: 'AUDIT-PKG-002',
        traceId: 'TRACE-PKG-002',
        purchaseActionStatus: 'closed',
        qualityActionStatus: 'open',
        dispatchSteps: [
          { module: '采购', owner: '采购主管', status: 'closed', evidence: 'EV-PUR-002' },
        ],
      },
    ])
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('设备停机包')
    expect(wrapper.text()).toContain('生成设备停机恢复包')
    expect(wrapper.text()).toContain('报表导出')
    expect(wrapper.text()).toContain('已拒绝')
    expect(wrapper.text()).toContain('AUDIT-ACTION-EXPORT-001')

    const packageCards = wrapper.findAll('.assistant-package-card')
    expect(packageCards).toHaveLength(2)
    expect(packageCards[0].find('.policy-accepted').text()).toContain('已闭合')
    expect(packageCards[1].find('.policy-guarded').text()).toContain('责任动作处理中')
    expect(packageCards[0].text()).toContain('TRACE-PKG-CLOSE-001')
    expect(packageCards[0].text()).toContain('供应商到料承诺已确认')

    const actionButtons = packageCards[0].findAll('.assistant-package-actions .btn-sm')
    await actionButtons[0].trigger('click')
    await actionButtons[1].trigger('click')
    await actionButtons[2].trigger('click')
    await actionButtons[3].trigger('click')

    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(routerPush).toHaveBeenCalledWith('/risk')
    expect(routerPush).toHaveBeenCalledWith('/purchase')
    expect(routerPush).toHaveBeenCalledWith('/quality')
  })

  it('renders POC rollout, pilot run, and hypercare evidence as a single admin governance chain', async () => {
    readPocRolloutPackageRecordBackendFirst.mockResolvedValueOnce({
      id: 'poc-rollout-package-20260615',
      title: 'POC 转上线交付行动包',
      targetCustomer: '华东样板工厂',
      sourceMeetingId: 'POC-REVIEW-20260615-001',
      sourceAuditId: 'AUD-POC-REVIEW-20260615',
      status: 'ready',
      statusLabel: '待客户交付启动会确认',
      rolloutWindow: 'T+7 完成上线准备，T+14 首批真实工单运行',
      goLiveGate: 'POC 评分通过、客户样例齐套、OTD 证据链可审计',
      owner: '交付经理 / 客户厂长',
      successCriteria: ['首批真实工单 >= 30 单'],
      actions: [
        {
          module: '交付项目',
          owner: '交付经理',
          action: '冻结试点范围和验收口径',
          dueAt: 'T+1',
          evidence: 'TRACE-POC-ROLLOUT-KICKOFF-20260615',
        },
        {
          module: '治理审计',
          owner: '项目经理',
          action: '复核 OTD、责任动作和审计导出',
          dueAt: 'T+14',
          evidence: 'TRACE-POC-ROLLOUT-GOVERNANCE-20260615',
        },
      ],
      auditId: 'AUD-POC-ROLLOUT-20260615',
      traceId: 'TRACE-POC-ROLLOUT-20260615',
      createdAt: '2026-06-15T08:00:00.000Z',
      summary: 'POC 已进入上线交付准备，交付、接口、现场运行和治理审计责任动作已固化。',
    })
    readPocPilotRunRecordBackendFirst.mockResolvedValueOnce({
      id: 'poc-pilot-run-20260615',
      title: 'POC 首批真实工单试点运行确认',
      targetCustomer: '华东样板工厂',
      sourcePackageId: 'poc-rollout-package-20260615',
      sourceAuditId: 'AUD-POC-ROLLOUT-20260615',
      status: 'closed',
      statusLabel: '首批真实工单已跑通',
      runWindow: 'T+14 首批真实工单上线班次',
      batchId: 'PILOT-WO-BATCH-20260615-001',
      sampleSize: 30,
      otdTarget: '>= 96%',
      actualOtd: '97%',
      owner: '调度主管 / 生产班组长 / 交付经理',
      workOrders: [],
      checkpoints: [],
      acceptanceCriteria: ['30 单真实工单全部完成排产建议、人工确认和执行回写。'],
      auditId: 'AUD-POC-PILOT-RUN-20260615',
      traceId: 'TRACE-POC-PILOT-RUN-20260615',
      createdAt: '2026-06-15T09:00:00.000Z',
      summary: '首批 30 单真实工单已跑通排产建议采纳、生产执行、异常回写和审计复盘。',
    })
    readPocHypercareAcceptanceRecordBackendFirst.mockResolvedValueOnce({
      id: 'poc-hypercare-acceptance-20260615',
      title: 'POC 正式上线验收与 Hypercare 稳定运行监控包',
      targetCustomer: '华东样板工厂',
      sourcePilotRunId: 'poc-pilot-run-20260615',
      sourcePilotAuditId: 'AUD-POC-PILOT-RUN-20260615',
      status: 'active',
      statusLabel: 'Hypercare 稳定运行中',
      goLiveWindow: 'T+15 正式上线，T+21 完成 Hypercare 验收',
      hypercareDays: 7,
      otdTarget: '>= 96%',
      actualOtd: '97%',
      oeeTarget: '>= 78%',
      currentOee: '82%',
      incidentCount: 1,
      unresolvedP1P2: 0,
      acceptanceGate: 'OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付',
      owner: '客户厂长 / 交付经理 / 调度主管',
      monitors: [],
      checkpoints: [],
      auditId: 'AUD-POC-HYPERCARE-20260615',
      traceId: 'TRACE-POC-HYPERCARE-20260615',
      createdAt: '2026-06-15T10:00:00.000Z',
      summary: 'Hypercare 监控跟踪 OTD 97%、OEE 82%、P1/P2 未关闭 0 个和 AI 建议采纳率。',
    })
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()

    const pocCards = wrapper.findAll('.poc-evidence-card')
    expect(pocCards).toHaveLength(3)
    expect(wrapper.text()).toContain('POC 上线交付')
    expect(wrapper.text()).toContain('POC 试点运行')
    expect(wrapper.text()).toContain('POC Hypercare')
    expect(wrapper.text()).toContain('行动包已生成')
    expect(wrapper.text()).toContain('已闭环')
    expect(wrapper.text()).toContain('Hypercare 稳定运行中')
    expect(pocCards[0].text()).toContain('AUD-POC-ROLLOUT-20260615')
    expect(pocCards[0].text()).toContain('2 项')
    expect(pocCards[1].text()).toContain('PILOT-WO-BATCH-20260615-001')
    expect(pocCards[1].text()).toContain('97% / 30 单')
    expect(pocCards[2].text()).toContain('OTD >= 96%、P1/P2 未关闭事件 = 0、审计导出可交付')
    expect(pocCards[2].text()).toContain('OTD 97% / OEE 82% / P1P2 0')
    expect(pocCards[2].text()).toContain('AUD-POC-HYPERCARE-20260615')
  })

  it('refreshes agent config approvals from backend authority after a successful decision', async () => {
    readAgentConfigApprovalsBackendFirst
      .mockResolvedValueOnce([{
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
      .mockResolvedValueOnce([{
        id: 'cfg-quality-experiment-gate',
        title: '质量推荐实验扩大门禁',
        replayTitle: '质量推荐实验扩大门禁复验通过率从 100% 调整为 95%',
        configKey: 'QualityRecommendation.ExperimentExpansionGate',
        fromValue: '100%',
        toValue: '95%',
        reason: 'R4 同设备族实验复验 98%，申请扩大灰度。',
        owner: '质量主管审批',
        status: 'approved',
        auditId: 'TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001',
        submittedBy: 'admin',
        submittedAt: '2026-05-21T18:30:00.000Z',
        decidedBy: 'admin',
        decidedAt: '2026-06-15T09:00:00.000Z',
        risk: '扩大灰度可能引入负样本误召回。',
      }])
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
    expect(readAgentConfigApprovalsBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.approval-row')
      .find(row => row.text().includes('质量推荐实验扩大门禁'))!
      .text()).toContain('approved')
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

  it('fails loud when gray release expansion is written but decision refresh fails', async () => {
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
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst
      .mockResolvedValueOnce([{
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
      .mockRejectedValueOnce(new Error('gray decision refresh unavailable'))
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
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(2)
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('质量推荐灰度扩大确认已写入，但灰度决策列表刷新失败')
    expect(alert.text()).toContain('gray decision refresh unavailable')
    expect(grayCard!.text()).toContain('等待质量主管确认')
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

  it('refreshes gray review issue evidence after negative samples close the rollback issue', async () => {
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
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst
      .mockResolvedValueOnce([{
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
      .mockResolvedValueOnce([{
        id: 'decision-r3-rolled-back',
        trainingSetVersion: 'R3',
        targetWorkOrderId: 'WO-001',
        operationCode: 'OP-10',
        releaseCycleLabel: '2026-W23',
        decision: 'rolled_back',
        decisionLabel: '回滚到 R2',
        approvalStatus: 'approved',
        approvalLabel: '已回滚',
        statusClass: 'accepted',
        auditId: 'AUDIT-GRAY-DECISION-R3-ROLLBACK-001',
        traceId: 'TRACE-GRAY-DECISION-R3-ROLLBACK-001',
        reviewIssueId: 'GRAY-ISSUE-R3-001',
        reviewIssueStatus: 'closed',
        reviewIssueLabel: '负样本已补充',
        reviewIssueTraceId: 'TRACE-GRAY-ISSUE-R3-001',
        reviewIssueValidationAuditId: 'AUDIT-GRAY-ISSUE-R3-NEGATIVE-SAMPLE-CLOSED',
      }])
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    let grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    await grayCard!.find('.gray-decision-result .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(closeQualityKnowledgeGrayReviewIssueWithNegativeSample).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'decision-r3-rolled-back' }),
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard!.text()).toContain('负样本已补充')
    expect(grayCard!.text()).toContain('AUDIT-GRAY-ISSUE-R3-NEGATIVE-SAMPLE-CLOSED')
    expect(grayCard!.findAll('.gray-decision-result .btn-sm')).toHaveLength(0)
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

  it('refreshes gray release governance records after successful write decisions', async () => {
    buildQualityKnowledgeGrayReleaseMonitorRecords.mockReturnValue([{
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
    readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{
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
      .mockResolvedValueOnce([{
        id: 'decision-r3-expanded',
        trainingSetVersion: 'R3',
        targetWorkOrderId: 'WO-001',
        operationCode: 'OP-10',
        releaseCycleLabel: '2026-W23',
        decision: 'expanded',
        decisionLabel: '扩大灰度',
        approvalStatus: 'approved',
        approvalLabel: '质量主管已确认',
        statusClass: 'accepted',
        auditId: 'AUDIT-GRAY-DECISION-R3-001',
        traceId: 'TRACE-GRAY-DECISION-R3-APPROVED',
      }])
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()
    let grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard).toBeDefined()
    await grayCard!.find('.gray-decision-actions .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(decideQualityKnowledgeGrayRelease).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'gray-r3-wo-001-op-10' }),
      'expanded',
      expect.any(String),
    )
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    grayCard = wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))
    expect(grayCard!.text()).toContain('AUDIT-GRAY-DECISION-R3-001')
    expect(grayCard!.text()).toContain('等待质量主管确认')

    await grayCard!.find('.gray-decision-result .btn-sm.approve').trigger('click')
    await flushPromises()

    expect(approveQualityKnowledgeGrayReleaseExpansion).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'decision-r3-expanded' }),
      expect.any(String),
    )
    expect(readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst).toHaveBeenCalledTimes(3)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.quality-gray-monitor-card')
      .find(card => card.text().includes('R3 质量推荐灰度'))!
      .text()).toContain('质量主管已确认')
  })

  it('renders labor qualification governance and routes each review action to its source board', async () => {
    readLaborReassignmentsBackendFirst.mockResolvedValueOnce([{
      id: 'labor-reassignment-WO-013-heat-treatment',
      workOrderNumber: 'WO-013',
      operationCode: 'OP-10',
      operationCodes: ['OP-10', 'OP-20'],
      operationName: '淬火 / 回火',
      blockedEmployeeNumber: 'EMP-003',
      blockedEmployeeName: '王五',
      blockedCertification: '热处理上岗证',
      blockedExpiresAt: '2026-05-25',
      replacementEmployeeNumber: 'EMP-006',
      replacementEmployeeName: '孙八',
      replacementTeam: '甲班',
      replacementShift: '白班',
      replacementSkill: '热处理替班复核 / 派工确认',
      replacementCertification: '班组长授权',
      replacementExpiresAt: '2026-09-30',
      reviewerEmployeeNumber: 'EMP-004',
      reviewerName: '赵六',
      reviewerRole: '工程放行',
      reason: 'EMP-003 热处理上岗证临期，WO-013 热处理工序改由 EMP-006 接管开工复核。',
      auditId: 'AUD-LABOR-REASSIGN-20260520-001',
      traceId: 'TRACE-LABOR-REASSIGN-WO-013-OP-10',
      createdAt: '2026-06-15T08:00:00.000Z',
      status: 'executed',
    }])
    readLaborQualificationBlocksBackendFirst.mockResolvedValueOnce([{
      id: 'labor-qualification-block-WO-013-heat-treatment',
      workOrderNumber: 'WO-013',
      operationCode: 'OP-10',
      operationCodes: ['OP-10', 'OP-20'],
      operationName: '淬火 / 回火',
      blockedEmployeeNumber: 'EMP-003',
      blockedEmployeeName: '王五',
      blockedCertification: '热处理上岗证',
      blockedExpiresAt: '2026-05-25',
      requiredSkill: '热处理',
      requiredTeam: '乙班',
      requiredShift: '夜班',
      reviewerEmployeeNumber: 'EMP-004',
      reviewerName: '赵六',
      reviewerRole: '工程放行',
      reason: '未找到有效替班候选，WO-013 热处理必须停工复核。',
      auditId: 'AUD-LABOR-BLOCK-20260520-001',
      traceId: 'TRACE-LABOR-BLOCK-WO-013-OP-10',
      createdAt: '2026-06-15T08:05:00.000Z',
      status: 'active',
    }])
    const wrapper = mountAdminBoard()
    await flushPromises()

    await wrapper.findAll('[role="tab"]')[4].trigger('click')
    await flushPromises()

    const laborCards = wrapper.findAll('.labor-governance-card')
    expect(laborCards).toHaveLength(2)
    expect(wrapper.text()).toContain('1 阻断 / 1 复核')
    expect(laborCards[0].text()).toContain('EMP-003 资质临期已生成 EMP-006 替班复核')
    expect(laborCards[0].text()).toContain('AUD-LABOR-REASSIGN-20260520-001')
    expect(laborCards[0].text()).toContain('TRACE-LABOR-REASSIGN-WO-013-OP-10')
    expect(laborCards[1].text()).toContain('WO-013 淬火 / 回火 人员资质阻断')
    expect(laborCards[1].text()).toContain('停工复核')
    expect(laborCards[1].text()).toContain('AUD-LABOR-BLOCK-20260520-001')

    await laborCards[0].findAll('button').find(button => button.text() === '查看人员管理')!.trigger('click')
    await laborCards[0].findAll('button').find(button => button.text() === '查看生产报工')!.trigger('click')
    await laborCards[0].findAll('button').find(button => button.text() === '查看 AI 排产')!.trigger('click')
    await laborCards[0].findAll('button').find(button => button.text() === '查看 OTD 报告')!.trigger('click')
    await laborCards[0].findAll('button').find(button => button.text() === '查看审计回放')!.trigger('click')

    expect(routerPush).toHaveBeenCalledWith('/employee')
    expect(routerPush).toHaveBeenCalledWith('/production')
    expect(routerPush).toHaveBeenCalledWith('/scheduling')
    expect(routerPush).toHaveBeenCalledWith('/report')
    expect(routerPush).toHaveBeenCalledWith('/audit-logs')
  })
})

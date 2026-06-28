import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
  decideAgentConfigApproval,
  readAgentConfigApprovals,
  readAgentConfigApprovalsBackendFirst,
  readQualityExperimentExpansionGatePolicy,
} from '../../src/utils/agent-config-approval-sync'

const queryAgentConfigApprovals = vi.hoisted(() => vi.fn())
const upsertAgentConfigApproval = vi.hoisted(() => vi.fn(() => Promise.resolve()))

vi.mock('../../src/api/governanceEvidence', () => ({
  queryAgentConfigApprovals,
  upsertAgentConfigApproval,
}))

describe('agent config approval sync', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    queryAgentConfigApprovals.mockReset()
    upsertAgentConfigApproval.mockClear()
  })

  it('persists approval decisions locally and syncs backend best-effort', async () => {
    const decided = decideAgentConfigApproval(QUALITY_EXPERIMENT_GATE_APPROVAL_ID, 'approved', 'qa-lead')
    await vi.dynamicImportSettled()

    expect(decided).toEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'approved',
      decidedBy: 'qa-lead',
      decidedAt: expect.any(String),
    }))
    expect(readAgentConfigApprovals()).toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'approved',
      decidedBy: 'qa-lead',
    }))
    expect(upsertAgentConfigApproval).toHaveBeenCalledWith(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'approved',
    }))
  })

  it('falls back to local approvals when backend returns no records', async () => {
    decideAgentConfigApproval(QUALITY_EXPERIMENT_GATE_APPROVAL_ID, 'rejected', 'qa-lead')
    queryAgentConfigApprovals.mockResolvedValueOnce([])

    await expect(readAgentConfigApprovalsBackendFirst()).resolves.toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'rejected',
      decidedBy: 'qa-lead',
    }))
  })

  it('keeps the newer local decision when backend approval evidence is stale', async () => {
    localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        status: 'approved',
        decidedBy: 'qa-lead',
        decidedAt: '2026-06-15T10:00:00.000Z',
      },
    ]))
    queryAgentConfigApprovals.mockResolvedValueOnce([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        status: 'rejected',
        decidedBy: 'admin',
        decidedAt: '2026-06-15T09:00:00.000Z',
        submittedAt: '2026-06-15T08:00:00.000Z',
      },
    ])

    await expect(readAgentConfigApprovalsBackendFirst()).resolves.toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'approved',
      decidedBy: 'qa-lead',
      decidedAt: '2026-06-15T10:00:00.000Z',
    }))
  })

  it('uses newer backend approval evidence when local decision is stale', async () => {
    localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        status: 'rejected',
        decidedBy: 'qa-lead',
        decidedAt: '2026-06-15T09:00:00.000Z',
      },
    ]))
    queryAgentConfigApprovals.mockResolvedValueOnce([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        title: '质量推荐实验扩大门禁 复验 100% -> >=95%',
        replayTitle: '质量推荐实验扩大门禁复验通过率从 100% 调整为 95%',
        configKey: 'Quality.RecommendationExperimentExpansionGate',
        fromValue: '采纳率 100% / 复验通过率 100% / 误召回 0 次',
        toValue: '采纳率 100% / 复验通过率 >=95% / 误召回 0 次',
        reason: '质量主管确认 R4 同设备族实验复验达标，允许扩大。',
        owner: '质量主管 / 知识库管理员',
        status: 'approved',
        auditId: 'TRACE-CFG-QA-EXPERIMENT-GATE-20260615-001',
        submittedBy: 'admin',
        submittedAt: '2026-06-15T08:00:00.000Z',
        risk: '复验阈值放宽必须绑定误召回 0 次和主管审批。',
        decidedBy: 'admin',
        decidedAt: '2026-06-15T10:00:00.000Z',
        policyArea: 'quality',
        policyMetrics: [
          { label: '推荐采纳率', fromValue: '100%', toValue: '100%' },
          { label: '复验通过率', fromValue: '100%', toValue: '>=95%' },
          { label: '负样本误召回', fromValue: '0 次', toValue: '0 次' },
        ],
        controlSummary: '审批通过后必须同时满足推荐采纳率 100%、复验通过率 >=95%、负样本误召回 0 次。',
      },
    ])

    await expect(readAgentConfigApprovalsBackendFirst()).resolves.toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'approved',
      decidedBy: 'admin',
      decidedAt: '2026-06-15T10:00:00.000Z',
    }))
  })

  it('keeps quality experiment expansion gate strict when backend approval evidence is incomplete', async () => {
    queryAgentConfigApprovals.mockResolvedValueOnce([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        status: 'approved',
        decidedBy: 'backend',
        decidedAt: '2026-06-15T10:00:00.000Z',
        submittedAt: '2026-06-15T08:00:00.000Z',
      },
    ])

    const approvals = await readAgentConfigApprovalsBackendFirst()
    const policy = readQualityExperimentExpansionGatePolicy(approvals)

    expect(approvals).toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'reviewing',
      controlSummary: expect.stringContaining('误召回 0 次'),
      policyMetrics: expect.arrayContaining([
        expect.objectContaining({ label: '复验通过率', toValue: '>=95%' }),
      ]),
    }))
    expect(policy).toEqual(expect.objectContaining({
      status: 'reviewing',
      effective: false,
      recheckPassRateMin: 100,
    }))
  })

  it('surfaces backend approval failures when fail-loud replay evidence is requested', async () => {
    queryAgentConfigApprovals.mockRejectedValueOnce(new Error('approval backend unavailable'))

    await expect(readAgentConfigApprovalsBackendFirst({ failLoud: true })).rejects.toThrow('approval backend unavailable')
  })

  it('surfaces non-array backend approval payloads when fail-loud replay evidence is requested', async () => {
    queryAgentConfigApprovals.mockResolvedValueOnce({ items: [] })

    await expect(readAgentConfigApprovalsBackendFirst({ failLoud: true })).rejects.toThrow('后端返回非数组审计载荷')
  })

  it('removes corrupt approval JSON so governance boards do not reuse stale overrides', () => {
    localStorage.setItem('aimes_agent_config_approvals', '{bad json')

    expect(readAgentConfigApprovals()).toContainEqual(expect.objectContaining({
      id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'reviewing',
    }))
    expect(localStorage.getItem('aimes_agent_config_approvals')).toBeNull()
  })

  it('ignores incomplete or invalid overrides that would corrupt approval status labels', () => {
    localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
      {
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        title: 'bad override',
        status: 'bypassed',
      },
      {
        id: 'cfg-llm-threshold',
        status: 'approved',
        decidedBy: 'admin',
      },
    ]))

    expect(readAgentConfigApprovals()).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
        status: 'reviewing',
      }),
      expect.objectContaining({
        id: 'cfg-llm-threshold',
        status: 'approved',
        decidedBy: 'admin',
      }),
    ]))
  })

  it('keeps quality experiment expansion gate strict until approval is explicitly approved', () => {
    const reviewingPolicy = readQualityExperimentExpansionGatePolicy()

    expect(reviewingPolicy).toEqual(expect.objectContaining({
      approvalId: QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
      status: 'reviewing',
      statusLabel: '复核中',
      recheckPassRateMin: 100,
      effective: false,
    }))
    expect(reviewingPolicy.policyLabel).toContain('复验 100%')

    decideAgentConfigApproval(QUALITY_EXPERIMENT_GATE_APPROVAL_ID, 'approved', 'qa-lead')
    const approvedPolicy = readQualityExperimentExpansionGatePolicy()

    expect(approvedPolicy).toEqual(expect.objectContaining({
      status: 'approved',
      statusLabel: '已通过',
      recheckPassRateMin: 95,
      effective: true,
    }))
    expect(approvedPolicy.policyLabel).toContain('复验 >=95%')
    expect(approvedPolicy.auditLabel).toContain('TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001')
  })

  it('does not fabricate an approval write when the requested config approval id is unknown', async () => {
    const decided = decideAgentConfigApproval('missing-config-approval', 'approved', 'admin')
    await vi.dynamicImportSettled()

    expect(decided).toBeNull()
    expect(upsertAgentConfigApproval).not.toHaveBeenCalled()
    expect(readAgentConfigApprovals()).not.toContainEqual(expect.objectContaining({
      id: 'missing-config-approval',
    }))
  })
})

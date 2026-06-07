import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  QUALITY_EXPERIMENT_GATE_APPROVAL_ID,
  decideAgentConfigApproval,
  readAgentConfigApprovals,
  readAgentConfigApprovalsBackendFirst,
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
})

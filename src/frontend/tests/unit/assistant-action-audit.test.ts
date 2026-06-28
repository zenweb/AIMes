import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import {
  readAssistantActionAudits,
  readAssistantActionAuditsBackendFirst,
  recordAssistantActionAudit,
} from '../../src/utils/assistant-action-audit'
import type { ChatAction } from '../../src/types/knowledge'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

function action(overrides: Partial<ChatAction> = {}): ChatAction {
  return {
    id: 'action-delivery-recovery',
    label: '生成交期恢复执行包',
    type: 'delivery_recovery_package',
    targetRoute: '/scheduling',
    resultMessage: '已生成交期恢复执行包。',
    auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-001',
    ...overrides,
  }
}

describe('assistant action audit', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
    httpGet.mockReset()
    httpPost.mockReset()
    vi.useRealTimers()
  })

  it('records permitted assistant action audits locally and syncs backend best-effort', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T08:00:00.000Z'))

    recordAssistantActionAudit({
      action: action(),
      actor: 'admin',
      role: 'Planner',
      permitted: true,
    })
    await vi.dynamicImportSettled()

    const records = readAssistantActionAudits()
    expect(records).toEqual([
      expect.objectContaining({
        id: 'AUD-CHAT-RECOVERY-PACKAGE-001-1780214400000',
        actionId: 'action-delivery-recovery',
        label: '生成交期恢复执行包',
        type: 'delivery_recovery_package',
        actor: 'admin',
        role: 'Planner',
        targetRoute: '/scheduling',
        auditCode: 'AUD-CHAT-RECOVERY-PACKAGE-001',
        traceId: 'TRACE-CHAT-RECOVERY-WO-RUSH-9001-20260521',
        resultMessage: '已生成交期恢复执行包。',
        permitted: true,
        createdAt: '2026-05-31T08:00:00.000Z',
      }),
    ])
    expect(httpPost).toHaveBeenCalledWith('/scheduling/assistant-action-audits', records[0])
  })

  it('records denied assistant action audits with generated audit code', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-31T09:00:00.000Z'))

    recordAssistantActionAudit({
      action: action({
        id: 'action-export',
        type: 'export_report',
        auditCode: undefined,
        resultMessage: '权限不足，无法导出。',
      }),
      actor: 'operator',
      role: 'Operator',
      permitted: false,
    })

    const records = readAssistantActionAudits()
    expect(records).toEqual([
      expect.objectContaining({
        id: 'AUD-CHAT-1780218000000-1780218000000',
        auditCode: 'AUD-CHAT-1780218000000',
        permitted: false,
      }),
    ])
    expect(records[0]).not.toHaveProperty('traceId')
  })

  it('falls back to local audits when backend returns no records', async () => {
    recordAssistantActionAudit({
      action: action(),
      actor: 'admin',
      role: 'Planner',
      permitted: true,
    })
    httpGet.mockResolvedValueOnce({ data: [] })

    await expect(readAssistantActionAuditsBackendFirst()).resolves.toEqual(readAssistantActionAudits())
    expect(httpGet).toHaveBeenCalledWith('/scheduling/assistant-action-audits', { params: { take: 12 } })
  })

  it('ignores incomplete backend audits so permission result labels and trace evidence stay auditable', async () => {
    recordAssistantActionAudit({
      action: action(),
      actor: 'admin',
      role: 'Planner',
      permitted: true,
    })
    httpGet.mockResolvedValueOnce({
      data: [
        {
          id: 'AUD-CHAT-PARTIAL',
          actionId: 'action-delivery-recovery',
          auditCode: 'AUD-CHAT-PARTIAL',
        },
      ],
    })

    await expect(readAssistantActionAuditsBackendFirst()).resolves.toEqual(readAssistantActionAudits())
  })

  it('surfaces backend failures when fail-loud replay evidence is requested', async () => {
    httpGet.mockRejectedValueOnce(new Error('assistant audit backend unavailable'))

    await expect(readAssistantActionAuditsBackendFirst({ failLoud: true })).rejects.toThrow('assistant audit backend unavailable')
  })

  it('surfaces non-array backend payloads when fail-loud replay evidence is requested', async () => {
    httpGet.mockResolvedValueOnce({ data: { items: [] } })

    await expect(readAssistantActionAuditsBackendFirst({ failLoud: true })).rejects.toThrow('后端返回非数组审计载荷')
  })

  it('caps local assistant action audits at 12 newest records', () => {
    for (let index = 0; index < 13; index += 1) {
      recordAssistantActionAudit({
        action: action({
          id: `action-${index}`,
          auditCode: `AUD-CHAT-${index}`,
        }),
        actor: 'admin',
        role: 'Planner',
        permitted: true,
      })
    }

    const records = readAssistantActionAudits()
    expect(records).toHaveLength(12)
    expect(records[0]?.actionId).toBe('action-12')
    expect(records.at(-1)?.actionId).toBe('action-1')
  })

  it('removes corrupt audit JSON so assistant boards do not render stale actions', () => {
    localStorage.setItem('aimes_assistant_action_audits', '{bad json')

    expect(readAssistantActionAudits()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_action_audits')).toBeNull()
  })

  it('removes incomplete audit records that cannot explain permission result or action label', () => {
    localStorage.setItem('aimes_assistant_action_audits', JSON.stringify([
      {
        id: 'AUD-CHAT-001',
        actionId: 'action-delivery-recovery',
        auditCode: 'AUD-CHAT-001',
      },
    ]))

    expect(readAssistantActionAudits()).toEqual([])
    expect(localStorage.getItem('aimes_assistant_action_audits')).toBeNull()
  })
})

import http from './http'
import type { AgentConfigApprovalRecord } from '../utils/agent-config-approval-sync'

export async function queryAgentConfigApprovals(take = 12, options?: { failLoud?: boolean }): Promise<AgentConfigApprovalRecord[]> {
  try {
    const { data } = await http.get<AgentConfigApprovalRecord[]>('/scheduling/agent-config-approvals', { params: { take } })
    return data
  } catch (error: unknown) {
    if (options?.failLoud) throw error
    return []
  }
}

export async function upsertAgentConfigApproval(item: AgentConfigApprovalRecord): Promise<AgentConfigApprovalRecord> {
  const { data } = await http.post<AgentConfigApprovalRecord>('/scheduling/agent-config-approvals', item)
  return data
}

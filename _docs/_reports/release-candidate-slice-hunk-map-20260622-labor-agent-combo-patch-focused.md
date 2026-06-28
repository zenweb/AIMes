# Focused Combo Patch Boundary

- GeneratedAt: 2026-06-22T00:59:48.0022323+08:00
- PatchPath: tmp/combo-labor-agent-e2e-20260622.patch
- Candidate: schedule-labor-retry-plus-agent-e2e
- Scope: exported combo patch only, not ambient working tree diff
- HunkCount: 12

## Included Token Hits

- AGENT_BACKEND_EVIDENCE_TITLES
- targetsAgentBackendMock
- usesLiveBackendMock
- mockSchedulingPlanApis
- mockLaborEvidenceRetryApis
- 人员证据启动读取失败后可重试
- 调度员 Agent 工作台通过后端 API
- 调度员 Agent 工作台后端 403
- 调度员 Agent 工作台 API 不可用

## Excluded Token Hits

- none

## Gate

- PASS: focused combo patch contains no excluded-theme tokens.

# 2026-07-05 Schedule Agent Workbench Adopt 403 Fail-Loud E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling Agent Workbench now has real-browser evidence that a backend 403 during recommendation adoption fails loud and does not present the action as successful.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleAgentWorkbenchPanel`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock path: `/api/v1/scheduling/agent/agent-decision-e2e-001/adopt`
- Target todo: `_docs/_todo/20260622-schedule-agent-workbench-reject-fail-loud-next-actions.md`

## Result

The existing Playwright E2E `调度员 Agent 工作台后端 403 时保留 fallback 并提示权限` verifies:

- backend recommendation generation succeeds first;
- the browser then attempts to adopt the recommendation;
- the mocked backend returns `403`;
- the workbench shows `采纳失败，请确认当前用户具有 Admin 或 Planner 权限。`;
- the test does not accept a silent success or forged adopted state as passing evidence.

No production code changed in this seal. The test already exists on current `V1`; this review closes the stale browser-evidence follow-up for the permission fail-loud branch.

## Verification

```text
$env:AIMES_E2E_PORT='4187'; npm run test:e2e -- --grep "调度员 Agent 工作台后端 403"
Result: 1 passed
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
- DeviceData field verification remains separate and still needs the correct runtime or log bundle.

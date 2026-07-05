# 2026-07-05 Schedule Agent Workbench API Unavailable Fail-Loud E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

调度员 Agent 工作台已有真实浏览器证据，证明后端建议 API 不可用时不会静默伪装成真实后端成功，而是保留 demo fallback 并显式提示失败原因。

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleAgentWorkbenchPanel`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock path: `/api/v1/scheduling/agent/recommendation`
- Target todo: `_docs/_todo/20260622-schedule-agent-workbench-adopt-fail-loud-next-actions.md`

## Result

The Playwright E2E `调度员 Agent 工作台 API 不可用时保留 demo fallback` verifies:

- the browser enters the live-backend route instead of offline-demo mode;
- clicking `生成后端建议` attempts the backend recommendation path;
- the mocked backend recommendation API is unavailable;
- the workbench shows `后端建议生成失败，已保留 demo fallback。`;
- the visible decision source includes `API 不可用 / demo fallback`;
- the test does not accept a silent backend success state as passing evidence.

No production code changed in this seal. The test already exists on current remote `V1`; this review closes the stale browser-evidence follow-up for the API-unavailable fail-loud branch.

## Verification

```text
$env:AIMES_E2E_PORT='4188'; npm run test:e2e -- --grep "调度员 Agent 工作台 API 不可用"
Result: 1 passed
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence or signed incident-review evidence for the elapsed window.
- DeviceData field verification remains separate and still needs the correct runtime or log bundle.

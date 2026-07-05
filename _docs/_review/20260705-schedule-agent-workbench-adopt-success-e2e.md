# 2026-07-05 Schedule Agent Workbench Adopt Success E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling Agent Workbench now has real-browser evidence for the backend recommendation adopt-success path.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleAgentWorkbenchPanel`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock paths:
  - `/api/v1/scheduling/agent/decisions`
  - `/api/v1/scheduling/agent/agent-decision-e2e-001/adopt`

## Result

The existing Playwright E2E generates backend recommendations, adopts the pending recommendation through the workbench, and verifies:

- the backend generation message is visible;
- the recommended `WeightedComposite` decision is visible;
- the adopt action succeeds through the backend mock;
- the success message says the backend wrote Agent action, audit, and adoption feedback;
- the decision source changes to `后端决策 / Adopted`.

No production code changed in this seal. The test already exists on current `V1`; this review closes the stale todo evidence gap.

## Verification

```text
$env:AIMES_E2E_PORT='4184'; npm run test:e2e -- --grep "调度员 Agent 工作台通过后端 API 生成并采纳推荐"
Result: 1 passed
```

## Boundary

- This is frontend quality hardening for an existing scheduling workflow.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
- DeviceData field verification remains separate and still needs the correct runtime or log bundle.

# 2026-07-05 Schedule Agent Workbench Reject Success E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling Agent Workbench now has real-browser evidence for the backend recommendation reject-success path. This closes the paired browser coverage gap called out after the existing adopt-success unit and E2E coverage.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleAgentWorkbenchPanel`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock path: `/api/v1/scheduling/agent/agent-decision-e2e-001/reject`

## Result

- Added a Playwright E2E that generates a backend recommendation, rejects it through the workbench, and verifies:
  - the reject success message is visible;
  - the decision source changes to `后端决策 / Rejected`;
  - adopt and reject actions are disabled after the decision leaves `PendingReview`.
- No production code changed because unit coverage already proved the component behavior and the current browser path works.

## Verification

```text
npm run test:e2e -- --grep "调度员 Agent 工作台通过后端 API 生成并拒绝推荐"
Result: 1 passed

npm run lint -- tests/e2e/scheduling.spec.ts
Result: PASS
```

## Boundary

- This is frontend quality hardening for an existing scheduling workflow.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.

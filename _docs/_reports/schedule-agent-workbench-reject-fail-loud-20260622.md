# 2026-06-22 Report: Schedule Agent Workbench Reject Fail Loud

## Scope
- Hardened the existing ScheduleAgentWorkbenchPanel backend rejection failure path.
- Added regression evidence that failed backend rejection is surfaced as an assertive alert and does not silently change the decision status.
- No production code changed in this slice.

## Evidence
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts -t "fails loud when rejecting"`: PASS, 1 selected test.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts`: PASS, 9 tests.
- `npm run test:unit`: PASS, 118 files / 1240 tests.

## Result
- When backend rejection fails, the workbench announces `拒绝失败，请确认当前用户具有 Admin 或 Planner 权限。`.
- The failure note uses `role=alert` and `aria-live=assertive`.
- The backend decision status remains `PendingReview`, avoiding a false rejected state.

## Boundary
- This is frontend unit evidence for an existing high-risk Agent decision action.
- It does not close the full CC remediation objective or release gates.

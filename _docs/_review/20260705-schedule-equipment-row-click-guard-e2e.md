# 2026-07-05 Schedule equipment row click guard E2E review

## Decision

`PASS`

Added real-browser evidence that clicking an equipment group row in the Scheduling Gantt does not open a work-order detail panel and does not request work-order detail data.

## Scope

- Existing feature: Scheduling Gantt row interaction guard.
- Target gap: `_docs/_todo/20260622-schedule-equipment-row-click-guard-next-actions.md` requested browser-level Gantt row interaction evidence for the already implemented parent-row guard.
- This slice does not change production behavior. It adds browser coverage and routes this test through live-backend mock mode.

## Evidence

- Test added: `点击设备行时真实浏览器不打开工单详情`.
- The browser uses the Scheduling live-backend mock plan with equipment group `eq-agent-e2e-001` and child work order `WO-AGENT-E2E-001`.
- The test installs a fail-fast route for `/api/v1/scheduling/workorders/**` and counts matching requests.
- Assertions prove:
  - the equipment group row `eq-agent-e2e-001` is visible in the dhtmlx grid;
  - clicking that parent equipment row does not open `.detail-panel`;
  - the detail dialog keeps `aria-modal="false"`;
  - no work-order detail request is made.

## Root Cause Note

Initial browser evidence failed because the selector targeted `CNC Agent E2E`. In the dhtmlx grid, the parent equipment row exposes `eq-agent-e2e-001`; `CNC Agent E2E` appears on the child work-order row and task bar. The selector was corrected to target the actual parent equipment row, avoiding a false click on the child work order.

## Validation

- `npm run test:e2e -- --grep "点击设备行时真实浏览器不打开工单详情"`: `1 passed`.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `4 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `6f934cc512e0fbc9d9d37521eab91ccd1e7b5ace`: CI run `28729400561` passed and Agent Evaluation run `28729400556` passed.

## Boundary

This closes the browser-evidence gap for equipment group row click behavior. It does not close DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.

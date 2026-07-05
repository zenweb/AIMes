# 2026-07-05 Schedule task detail backend success E2E review

## Decision

`PASS`

Added real-browser evidence that clicking a scheduled task can load and render successful backend work-order detail data.

## Scope

- Existing feature: Scheduling task detail panel.
- Target gap: `_docs/_todo/20260622-schedule-task-detail-backend-success-next-actions.md` still required browser-level task-detail evidence after the unit-level backend success path had already been covered.
- This slice does not change production behavior. It adds E2E coverage only.

## Evidence

- Test added: `工单详情接口成功时真实浏览器展示后端工单详情`.
- The test routes `/api/v1/scheduling/workorders/**` to a successful backend DTO.
- The browser opens the task detail panel from a real Gantt task interaction, then switches `aimes_offline_demo` off before the task action so the work-order detail request is not skipped by offline-demo request protection.
- Assertions prove:
  - the detail panel opens with `role="dialog"` and `aria-modal="true"`;
  - exactly one work-order detail request is observed;
  - the dialog label changes to `工单详情：WO-AGENT-E2E-BACKEND`;
  - backend fields render in the UI: `WO-AGENT-E2E-BACKEND`, `真实浏览器后端工单`, `PRD-BROWSER-BACKEND`, `40%`, and `生产中`;
  - no `.panel-body.error` is shown;
  - the fallback error text `工单详情加载失败` is absent.

## Root Cause Note

Earlier browser attempts did not prove the backend success path:

- Live dhtmlx task focus/click did not reliably open the detail panel in this E2E environment.
- The `.task-explain-shortcuts` button opened `openDemoTaskExplanation(task)`, which only proves the local explanation path and never requests backend work-order details.

The final evidence uses the stable lightweight Gantt task interaction, then disables offline-demo request skipping inside the test before pressing `Enter`. This keeps the task interaction reliable while still proving the backend detail success branch.

## Validation

- `npm run test:e2e -- --grep "工单详情接口成功时真实浏览器展示后端工单详情"`: `1 passed`.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|工单详情接口成功时真实浏览器展示后端工单详情|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `5 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `5a9333e495956d69fe91ebc81a073286e9a846ba`: CI run `28730819938` passed and Agent Evaluation run `28730819940` passed.

## Boundary

This closes the browser-evidence gap for task-detail backend success. It does not close the blocked double-click browser evidence, DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.

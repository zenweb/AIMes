# 2026-07-05 Schedule Task Detail Double-Click Browser Evidence Changelog

## Added

- Added `_docs/_issue/20260705-schedule-task-detail-dblclick-browser-evidence-blocked.md`.
- Added `_docs/_review/20260705-schedule-task-detail-dblclick-browser-evidence.md`.

## Investigated

- Attempted to add browser evidence for double-clicking a Scheduling Gantt task and loading backend work-order details.
- Confirmed the target E2E interaction did not produce stable evidence in the current production-build E2E surface.

## Verified

- `npm run lint -- tests/e2e/scheduling.spec.ts src/components/gantt/GanttChart.vue`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts src/frontend/src/components/gantt/GanttChart.vue`: passed.
- `npm run test:e2e -- --grep "双击甘特任务后真实浏览器展示后端工单详情"`: failed; not shipped as PASS evidence.

## Result

- Resolved the blocked browser evidence by adding lightweight Gantt double-click parity and stabilizing the lightweight marker layout.
- Added real-browser evidence for double-clicking a Scheduling Gantt task and rendering backend work-order details.
- The separate DeviceData field deployment verification, quarantine timing behavior debt, submit-lock concurrency behavior debt, and strict gray-observation evidence remain open boundaries.

## Verified

- `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "emits task double-clicks from lightweight markers"`: red before implementation, then passed after the lightweight `taskDblClick` parity fix.
- `npm run test:e2e -- --grep "双击甘特任务后真实浏览器展示后端工单详情"`: first failed because task markers inherited dhtmlx positioning and then the guidance layer intercepted pointer events; passed after layout isolation.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|工单详情接口成功时真实浏览器展示后端工单详情|双击甘特任务后真实浏览器展示后端工单详情|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `6 passed`.
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`: `33 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts tests/unit/gantt-chart.test.ts src/components/gantt/GanttChart.vue`: passed.
- GitHub `V1` commit `ff1a1635ae46a9bfc1ddd30b88a4335475b87156`: CI run `28731592321` passed and Agent Evaluation run `28731592337` passed.

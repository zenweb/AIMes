# 2026-07-05 Schedule task detail double-click browser evidence review

## Decision

`PASS`

Resolved the previously blocked Scheduling task-detail double-click evidence by making the lightweight Gantt fallback match the existing dhtmlx `taskDblClick` semantic event and by stabilizing the lightweight marker layout for real pointer interaction.

## Scope

- Existing feature: Scheduling Gantt task detail opening.
- Target gap: `_docs/_issue/20260705-schedule-task-detail-dblclick-browser-evidence-blocked.md` recorded that double-click browser evidence could not be produced from the current E2E interaction target.
- Production dhtmlx behavior is unchanged. This slice only adds parity to the lightweight fallback used by offline-demo E2E and fixes its marker layout so visible task markers are actually clickable.

## Root Cause

The blocked attempt had two separate causes:

- Lightweight Gantt markers did not emit `taskDblClick`, while the dhtmlx path already did.
- Lightweight markers reused the global dhtmlx `.gantt_task_line` class and inherited absolute task positioning. The first marker was overlapped by another marker, and after partial layout isolation the guidance panel still intercepted pointer events because the marker list was absolutely positioned under it.

## Changes

- Added `@dblclick="emitLightweightTaskDblClick(task.id)"` to lightweight Gantt task markers.
- Added a focused unit test proving lightweight markers emit `taskDblClick` with the same task id semantics as dhtmlx.
- Changed hidden lightweight marker containers to `pointer-events: none`.
- Changed visible lightweight marker containers to normal document flow with `pointer-events: auto`.
- Explicitly reset lightweight marker task spans to static positioning, auto width/height, and stable line height.
- Added real-browser E2E `双击甘特任务后真实浏览器展示后端工单详情`, proving a double-click opens backend work-order detail data.

## Validation

- `npm run test:unit -- tests/unit/gantt-chart.test.ts -t "emits task double-clicks from lightweight markers"`: failed before implementation with `taskDblClick` undefined, then passed.
- `npm run test:e2e -- --grep "双击甘特任务后真实浏览器展示后端工单详情"`: failed before layout fix due to pointer interception, then passed.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|工单详情接口成功时真实浏览器展示后端工单详情|双击甘特任务后真实浏览器展示后端工单详情|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `6 passed`.
- `npm run test:unit -- tests/unit/gantt-chart.test.ts`: `33 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts tests/unit/gantt-chart.test.ts src/components/gantt/GanttChart.vue`: passed.

## Boundary

This closes only the Scheduling task-detail double-click browser evidence gap. It does not close DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation evidence.

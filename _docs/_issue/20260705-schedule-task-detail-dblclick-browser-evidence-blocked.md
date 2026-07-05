# 2026-07-05 Schedule Task Detail Double-Click Browser Evidence Blocked

## Severity

`MEDIUM`

## Status

`RESOLVED`

## Summary

The planned Scheduling slice was to add real-browser evidence for opening work-order details by double-clicking a Gantt task. The slice was not closed because the current E2E surface could not produce a stable double-click interaction against the Gantt task path.

Resolved on 2026-07-05 by adding lightweight Gantt double-click parity and stabilizing the lightweight marker layout so real pointer double-clicks can target visible task markers.

## What Was Tried

- Added a targeted Playwright E2E for `双击甘特任务后真实浏览器展示后端工单详情`.
- Mocked `/api/v1/scheduling/workorders/wo-agent-e2e-001` with a successful backend work-order detail response.
- Tried double-clicking:
  - `.gantt_task_line`
  - `.gantt_task .gantt_task_line`
  - `.gantt-e2e-markers .gantt_task_line`
- Temporarily tested parity by adding a `dblclick` emitter to lightweight Gantt markers.

## Observed Result

- `.gantt_task_line` and `.gantt_task .gantt_task_line` did not open the detail panel; the panel stayed closed with `aria-modal="false"`.
- `.gantt-e2e-markers .gantt_task_line` was not visible in the current production-build E2E run.
- The failed runs did not prove a product regression in `handleTaskDblClick`; they proved the current E2E target is not a stable browser-level proof point for this interaction.

## Verification

```text
npm run lint -- tests/e2e/scheduling.spec.ts src/components/gantt/GanttChart.vue
Result: PASS

git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts src/frontend/src/components/gantt/GanttChart.vue
Result: PASS

npm run test:e2e -- --grep "双击甘特任务后真实浏览器展示后端工单详情"
Result: FAIL
Reason: detail panel did not open, then lightweight marker target was not visible.
```

## Final Handling

- The initial unverified test and temporary marker experiment were not shipped as PASS evidence.
- The final fix keeps the production dhtmlx path unchanged and adds parity for the existing lightweight Gantt fallback:
  - lightweight task markers now emit `taskDblClick`;
  - hidden lightweight markers no longer intercept pointer events;
  - visible lightweight markers render in normal document flow and opt out of dhtmlx absolute task positioning.
- Real-browser evidence now proves double-clicking a visible lightweight Gantt task opens backend work-order details.

## Required Next Step

No retry is required for this blocked item. Continue with the remaining release boundaries that are not part of this slice.

## Boundary

- Existing keyboard-open detail evidence remains valid.
- Existing failure fallback detail evidence remains valid.
- The double-click success browser evidence is now closed by `_docs/_review/20260705-schedule-task-detail-dblclick-browser-evidence.md`.
- DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, and strict gray-observation evidence remain separate.

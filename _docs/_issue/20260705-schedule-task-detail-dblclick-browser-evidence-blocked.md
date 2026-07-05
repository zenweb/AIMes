# 2026-07-05 Schedule Task Detail Double-Click Browser Evidence Blocked

## Severity

`MEDIUM`

## Status

`BLOCKED_E2E_INTERACTION_TARGET`

## Summary

The planned Scheduling slice was to add real-browser evidence for opening work-order details by double-clicking a Gantt task. The slice was not closed because the current E2E surface could not produce a stable double-click interaction against the Gantt task path.

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

- The unverified test and temporary Gantt marker code were removed.
- No production behavior change is being shipped from this failed slice.
- This issue is recorded so the next attempt starts from the interaction-target problem instead of repeating blind selector changes.

## Required Next Step

Pick one explicit strategy before retrying this evidence:

- expose a stable test-only marker that mirrors `taskDblClick` and is visible in production E2E builds;
- add a component-level test for lightweight marker `dblclick` parity and keep browser E2E on the already-proven keyboard success path;
- run a headed dhtmlx-specific browser probe to identify the actual double-click target and coordinates before adding another E2E.

## Boundary

- Existing keyboard-open detail evidence remains valid.
- Existing failure fallback detail evidence remains valid.
- The double-click success browser evidence remains open and must not be marked PASS.

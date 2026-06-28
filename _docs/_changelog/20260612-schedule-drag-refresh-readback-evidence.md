# 2026-06-12 Schedule Drag Refresh Readback Evidence

## Changed
- Added a real dhtmlx browser regression for the scheduling drag-save path: after dragging `WO-RUSH-9001`, clicking `刷新` must issue a fresh `GET /api/v1/scheduling/current` and read back the same `plannedStartTime/plannedEndTime` that was sent to the reschedule PATCH.
- Refactored the dhtmlx E2E plan fixture into `createDhtmlxSchedulePlan()` so the refresh-readback test can mutate the mocked backend read model after PATCH.
- Hardened the real mouse drag helper so it waits for the reschedule request and retries the drag once when dhtmlx treats the first gesture as selection instead of a persisted drag.

## Evidence
- `npm run test:e2e -- --grep "真实 dhtmlx 拖拽保存后刷新从后端读回同一窗口"`: 1 passed.
- `npm run test:e2e -- --grep "真实 dhtmlx"`: 4 passed.
- Browser artifacts are under `output/playwright/20260612-schedule-rush-formal-writeback/`.

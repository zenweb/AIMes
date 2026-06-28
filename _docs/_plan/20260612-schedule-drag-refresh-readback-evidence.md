# 2026-06-12 Schedule Drag Refresh Readback Plan

## Objective
- Close the browser evidence gap for the scheduling drag-save boutique path: prove save, refresh, and readback are connected.

## Success Criteria
- Real dhtmlx mode is used; lightweight markers/offline demo remain disabled.
- Dragging `WO-RUSH-9001` sends a reschedule PATCH.
- Refreshing the page data calls `GET /api/v1/scheduling/current`.
- The readback window equals the saved PATCH window.
- Existing real dhtmlx render, save, and save-failure tests still pass.

## Validation
- `npm run test:e2e -- --grep "真实 dhtmlx 拖拽保存后刷新从后端读回同一窗口"` passed.
- `npm run test:e2e -- --grep "真实 dhtmlx"` passed.

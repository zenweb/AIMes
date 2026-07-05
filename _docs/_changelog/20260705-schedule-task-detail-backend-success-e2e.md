# 2026-07-05 Schedule task detail backend success E2E changelog

## Changed

- Added a real-browser Scheduling E2E for backend work-order detail success after opening a task detail panel.
- Updated `_docs/_todo/20260622-schedule-task-detail-backend-success-next-actions.md` so the browser-level evidence item no longer remains open.
- Added `_docs/_review/20260705-schedule-task-detail-backend-success-e2e.md` with evidence, validation, and boundary notes.

## Verified

- `npm run test:e2e -- --grep "工单详情接口成功时真实浏览器展示后端工单详情"`: `1 passed`.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|工单详情接口成功时真实浏览器展示后端工单详情|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `5 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.

## Notes

- Earlier live dhtmlx click/focus attempts were unstable and did not open the panel in this environment.
- The task shortcut button was intentionally not used as final evidence because it only opens local demo explanation and cannot prove backend success.
- Final evidence uses the stable lightweight Gantt task interaction and disables offline-demo request skipping inside the test before triggering the task detail action.
- Remaining boundaries are unchanged: double-click browser evidence is blocked by strategy, DeviceData still needs field deployment observation, and the two behavior-test debts remain explicitly non-release-blocking quality debt.

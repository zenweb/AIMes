# 2026-07-05 Schedule equipment row click guard E2E changelog

## Changed

- Added a real-browser Scheduling E2E for clicking an equipment group row without opening work-order detail.
- Added the new test title to the Scheduling E2E live-backend mock routing list so the browser uses mocked live API responses instead of offline-demo request skipping.
- Updated `_docs/_todo/20260622-schedule-equipment-row-click-guard-next-actions.md` so the browser-evidence item no longer remains listed as open.

## Verified

- `npm run test:e2e -- --grep "点击设备行时真实浏览器不打开工单详情"`: `1 passed`.
- `npm run test:e2e -- --grep "点击任务条展示任务级排产解释|工单详情接口失败时真实浏览器展示本地排产解释兜底|点击设备行时真实浏览器不打开工单详情|甘特图路由往返后仍可用键盘打开工单详情"`: `4 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `6f934cc512e0fbc9d9d37521eab91ccd1e7b5ace`: CI run `28729400561` passed and Agent Evaluation run `28729400556` passed.

## Notes

- Initial evidence failed because the selector looked for `CNC Agent E2E`, while the parent dhtmlx equipment row exposes `eq-agent-e2e-001`. The final test targets the equipment group row directly.
- This slice does not change the DeviceData field-verification boundary or the known behavior-test debt for quarantine timing and submit-lock concurrency.

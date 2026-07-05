# 2026-07-05 Schedule assistant recovery risk refresh E2E changelog

## Changed

- Added a real-browser Scheduling E2E for Assistant recovery closure where the handoff closes successfully but risk-event refresh fails afterward.
- Added the new test title to the Scheduling E2E live-backend mock routing list so the browser uses mocked live API responses instead of offline-demo request skipping.
- Updated `_docs/_todo/20260622-schedule-assistant-recovery-risk-refresh-fail-loud-next-actions.md` so the browser-evidence item no longer remains listed as open.

## Verified

- `npm run test:e2e -- --grep "Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议"`: `1 passed`.
- `npm run test:e2e -- --grep "Assistant 恢复交接闭环后真实浏览器保留本地闭环建议|Assistant 恢复交接闭环后风险事件刷新失败时真实浏览器保留闭环建议"`: `2 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.

## Notes

- The new browser evidence intentionally separates risk refresh failure from recovery-package refresh failure.
- This slice does not change the DeviceData field-verification boundary or the known behavior-test debt for quarantine timing and submit-lock concurrency.

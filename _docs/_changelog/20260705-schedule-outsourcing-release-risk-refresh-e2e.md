# 2026-07-05 Schedule outsourcing release risk refresh E2E changelog

## Changed

- Added a real-browser Scheduling E2E for the outsourcing schedule release path where release succeeds but risk-event refresh fails afterward.
- Added the new test title to the Scheduling E2E live-backend mock routing list so the browser uses mocked live API responses instead of offline-demo request skipping.

## Verified

- `npm run test:e2e -- --grep "外协排产释放后风险事件刷新失败时真实浏览器保留释放确认"`: `1 passed`.
- `npm run test:e2e -- --grep "外协到货建议被采纳后真实浏览器归档排产释放证据|外协排产释放返回空审计时真实浏览器 fail-loud|外协排产释放后风险事件刷新失败时真实浏览器保留释放确认"`: `3 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `ef151283226ab3542e5230d3a3c8fd4980ed4aa7`: CI run `28728290918` passed and Agent Evaluation run `28728290926` passed.

## Notes

- First validation exposed a test harness routing issue: the new test stayed in offline-demo mode and surfaced `Offline demo mode skipped backend request`.
- The final browser evidence now proves the UI keeps the release confirmation visible while failing loud on the risk refresh failure.
- This slice does not change the DeviceData field-verification boundary or the known behavior-test debt for quarantine timing and submit-lock concurrency.

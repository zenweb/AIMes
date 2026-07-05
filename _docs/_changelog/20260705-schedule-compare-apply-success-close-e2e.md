# 2026-07-05 Schedule Compare Apply Success Close E2E Changelog

## Added

- Added a real-browser Playwright regression for the Scheduling multi-objective comparison apply-success close behavior.
- Added `_docs/_review/20260705-schedule-compare-apply-success-close-e2e.md`.

## Verified

- `npm run test:e2e -- --grep "多目标方案对比采用成功后真实浏览器关闭对话框并同步反馈"`:
  - first run failed because the test entered through `offlineDemo=1`;
  - final run passed after routing the test through the live-mock startup path.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.

## Result

- Multi-objective comparison apply-success browser evidence: `PASS`.
- No production code changed.

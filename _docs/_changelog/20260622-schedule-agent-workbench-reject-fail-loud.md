# 2026-06-22 Changelog: Schedule Agent Workbench Reject Fail Loud

- Added ScheduleAgentWorkbenchPanel regression coverage for failed backend rejection.
- Verified the workbench uses an assertive alert and preserves `PendingReview` when rejection is rejected by the backend.
- No production code changed; this is an existing-feature hardening and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts -t "fails loud when rejecting"`: PASS.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts`: PASS, 9 tests.
- `npm run test:unit`: PASS, 118 files / 1240 tests.

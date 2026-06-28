# 2026-06-22 Changelog: Schedule Agent Workbench Reject Success

- Added ScheduleAgentWorkbenchPanel regression coverage for successful backend recommendation rejection.
- Verified rejection passes the pending decision id and auditable operator reason to `rejectAgentDecision`.
- No production code changed; this is an existing-feature hardening and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts -t "rejects a pending backend recommendation"`: PASS.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts`: PASS, 7 tests.
- `npm run test:unit`: PASS, 118 files / 1238 tests.

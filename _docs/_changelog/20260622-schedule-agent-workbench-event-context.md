# 2026-06-22 Changelog: Schedule Agent Workbench Event Context

- Added ScheduleAgentWorkbenchPanel regression coverage for event-suggestion-driven backend recommendation generation.
- Verified the workbench sends `EventReview` context, `SchedulingEventQueue` source, warning severity, and event payload to `recommendAgentDecision`.
- No production code changed; this is an existing-feature hardening and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts -t "sends event suggestion context"`: PASS.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts`: PASS, 5 tests.
- `npm run test:unit`: PASS, 118 files / 1236 tests.

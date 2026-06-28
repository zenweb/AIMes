# 2026-06-22 Changelog: Schedule Agent Workbench Adopt Success

- Added ScheduleAgentWorkbenchPanel regression coverage for successful backend recommendation adoption.
- Verified adoption passes the pending decision id, recommended scenario id, and auditable operator reason to `adoptAgentDecision`.
- No production code changed; this is an existing-feature hardening and evidence slice.

## Validation
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts -t "adopts a pending backend recommendation"`: PASS.
- `npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts`: PASS, 6 tests.
- `npm run test:unit`: PASS, 118 files / 1237 tests.

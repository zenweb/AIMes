# 2026-06-15 Audit Replay Schedule Feedback Load Fail Loud

- Added a focused fail-loud regression test for `AuditDecisionReplayPanel.vue`.
- Covered the schedule adoption feedback audit list failure path:
  - `ScheduleAdoptionFeedbackUpsert` audit list loading fails
  - base replay cards remain visible
  - alert region stays assertive and names the schedule feedback failure
- Verified the existing production error handling already satisfies this behavior.
- Full frontend unit coverage originally reported `111 files / 1013 tests passed`.
- Regression refresh on 2026-06-19 reports `111 files / 1083 tests passed`.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot --coverage.reporter=text`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`
- Current refresh:
  - `npx vitest run tests/unit/audit-decision-replay-panel.test.ts --coverage.enabled=false` passed: 56 tests.
  - `npm run test:unit:coverage` passed: 111 files / 1083 tests.
  - `npm run lint` passed.

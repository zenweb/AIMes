# 2026-06-15 Audit Replay Quality Retraining Load Fail Loud

- Added a focused fail-loud regression test for `AuditDecisionReplayPanel.vue`.
- Covered the quality retraining version API rejection path:
  - retraining version loader rejects with a backend/API error
  - base replay cards remain visible
  - alert region stays assertive and names the retraining version failure
- Verified the existing production error handling already satisfies this behavior.
- Full frontend unit coverage now reports `111 files / 1008 tests passed`.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot --coverage.reporter=text`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

# 2026-06-15 Audit Replay Quality Feedback Load Fail Loud

- Added a focused fail-loud regression test for `AuditDecisionReplayPanel.vue`.
- Covered the quality feedback input load failure path:
  - quality recommendation feedback API rejection
  - quality retraining version non-array payload
  - base replay cards remain visible
  - alert region stays assertive and names both failed inputs
- Verified the existing production error handling already satisfies this behavior.
- Full frontend unit coverage now reports `111 files / 1006 tests passed`.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot --coverage.reporter=text`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

# 2026-06-15 Audit Replay Quality Gray Release Monitor Evidence

- Added a focused replay evidence test for `AuditDecisionReplayPanel.vue` that selects quality gray release monitoring replay by default.
- Covered the full monitor evidence chain:
  - republish cycle label
  - release audit and trace
  - gray scope and version strategy
  - monitoring metrics
  - recovered active selection after rollback
- Verified the new test passes with the existing production mapping.
- Re-ran related frontend regression and full frontend coverage.
- Full frontend unit coverage now reports `111 files / 1005 tests passed`.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

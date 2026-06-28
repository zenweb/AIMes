# 2026-06-15 Audit Replay Quality Experiment Candidate Evidence

- Added a focused replay evidence test for `AuditDecisionReplayPanel.vue` that selects quality experiment candidate replay by default.
- Covered the full candidate evidence chain:
  - rollback source audit and trace
  - adoption / recheck / false recall metrics
  - negative sample coverage and gap label
  - candidate audit and trace
  - next action
  - references
- Verified the new test passes with the existing production mapping.
- Re-ran related frontend regression and full frontend coverage.
- Full frontend unit coverage now reports `111 files / 1004 tests passed`.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

# 2026-06-15 Audit knowledge governance source route coverage

## Changed

- Added a regression test for knowledge governance review replay in `AuditDecisionReplayPanel`.
- Made `readKnowledgeGovernanceReviewsBackendFirst` controllable in the audit replay unit test so source-document traceability can be asserted directly.
- Added a `/knowledge` route target and `文档治理` route label to knowledge governance replay items, reusing the existing trace footer link UI.

## Verification

- RED: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` failed with 1 failed / 29 passed because `.trace-link` was missing for the knowledge governance replay.
- GREEN: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` passed 1 file / 30 tests.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` passed 111 files / 963 tests.

## Coverage

- Total after this slice: statements 87.18%, branches 73.62%, functions 86.45%, lines 90.46%.
- `AuditDecisionReplayPanel.vue`: statements 82.75%, branches 49.59%, functions 88.67%, lines 84.87%.

## Notes

- This improves an existing auditability path: knowledge governance review -> audit replay -> source document governance.
- PostgreSQL/staging release evidence is still not closed by this frontend quality slice.

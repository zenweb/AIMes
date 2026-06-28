# 2026-06-15 Audit Replay Quality Feedback Evidence

- Added audit replay coverage for quality recommendation feedback records.
- Verified quality recommendation feedback becomes the default replay chain when it is the strongest available replay evidence.
- Verified the replay detail exposes:
  - feedback trace ID
  - effect trend
  - feedback metrics
  - next training set version
  - next training trace ID
- No production code changed in this slice.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot`
  - 1 file passed / 33 tests passed
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot --coverage.reporter=text`
  - 1 file passed / 33 tests passed
  - `AuditDecisionReplayPanel.vue`: statements 83.98%, branches 51.69%, functions 91.66%, lines 85.87%
- `npm run test:unit -- tests/unit/audit-log-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/knowledge-citations.test.ts tests/unit/quality-board.test.ts --reporter=dot`
  - 4 files passed / 79 tests passed
- `npm run test:unit:coverage -- --reporter=dot`
  - 111 files passed / 1003 tests passed
  - overall: statements 88.19%, branches 75.41%, functions 88.01%, lines 91.38%

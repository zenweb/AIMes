# 2026-06-15 Quality Knowledge Experiment Decision Order

- Fixed quality recommendation experiment comparison records so repeated gray decisions for the same training version, work order, operation, and release cycle use the latest `decidedAt` decision.
- Added regression coverage for a stale rollback followed by an approved expansion.
- Preserved audit and trace evidence in the experiment comparison output:
  - latest expansion decision audit/trace
  - rollback decision audit/trace
  - feedback audit/trace
  - gate pass/fail label

## Verification

- `npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts --reporter=dot`
  - 1 file passed / 25 tests passed
- `npm run test:unit:coverage -- tests/unit/quality-knowledge-sample-sync.test.ts --reporter=dot --coverage.reporter=text`
  - 1 file passed / 25 tests passed
  - `quality-knowledge-sample-sync.ts`: statements 79.92%, branches 58.11%, functions 73.95%, lines 83.64%
- `npm run test:unit -- tests/unit/quality-board.test.ts tests/unit/knowledge-governance-panel.test.ts tests/unit/report-board.test.ts tests/unit/schedule-board.test.ts --reporter=dot`
  - 4 files passed / 119 tests passed
- `npm run test:unit:coverage -- --reporter=dot`
  - 111 files passed / 998 tests passed
  - overall: statements 88.08%, branches 74.71%, functions 87.58%, lines 91.3%
  - `quality-knowledge-sample-sync.ts`: statements 85.36%, branches 63.97%, functions 81.25%, lines 89.72%

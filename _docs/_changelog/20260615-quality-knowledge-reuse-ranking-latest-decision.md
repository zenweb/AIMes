# 2026-06-15 Quality Knowledge Reuse Ranking Latest Decision

- Fixed quality knowledge reuse ranking so gray recommendation version selection uses the latest gray decision per training version and release cycle.
- Prevented stale rollback decisions from excluding a later approved gray expansion.
- Updated excluded experiment evidence so only versions whose latest decision is still rollback are shown as excluded.
- Added regression coverage for stale rollback followed by approved expansion in the reuse ranking path.

## Verification

- `npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts --reporter=dot`
  - 1 file passed / 26 tests passed
- `npm run test:unit:coverage -- tests/unit/quality-knowledge-sample-sync.test.ts --reporter=dot --coverage.reporter=text`
  - 1 file passed / 26 tests passed
  - `quality-knowledge-sample-sync.ts`: statements 82.95%, branches 62.34%, functions 76.68%, lines 87.02%
- `npm run test:unit -- tests/unit/quality-board.test.ts tests/unit/knowledge-governance-panel.test.ts tests/unit/report-board.test.ts tests/unit/schedule-board.test.ts --reporter=dot`
  - 4 files passed / 119 tests passed
- `npm run test:unit:coverage -- --reporter=dot`
  - 111 files passed / 999 tests passed
  - overall: statements 88.1%, branches 74.94%, functions 87.69%, lines 91.32%
  - `quality-knowledge-sample-sync.ts`: statements 85.76%, branches 66.13%, functions 82.9%, lines 90.16%

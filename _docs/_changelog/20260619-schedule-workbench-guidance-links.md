# Changelog: Schedule workbench guidance links

Date: 2026-06-19

## Changed

- Added bilingual guidance before scheduler optimization, adoption, and drag writeback actions.
- Added contextual links from the scheduling workbench to:
  - `/audit-logs`
  - `/report`
  - `#schedule-workbench-help`
- Added an in-page `#schedule-workbench-help` section for complex scheduling operations.
- Added unit coverage proving the guidance copy, related links, and help anchor render.

## Verification

- RED: `npx vitest run tests/unit/schedule-board.test.ts --coverage.enabled=false -t "guides scheduler operators"` failed because `.schedule-workbench-guidance` did not exist.
- GREEN: the same targeted test passed after adding the guidance and help affordances.
- `npx vitest run tests/unit/schedule-board.test.ts --coverage.enabled=false` passed: 66 tests.
- Regression refresh: `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- Coverage totals: statements 89.71%, branches 77.15%, functions 89.92%, lines 92.83%.
- `npm run lint` passed.
- `npm run build` passed on the current worktree.
- Production preview browser evidence passed: `_docs/_reports/schedule-workbench-guidance-browser-20260619.md`.

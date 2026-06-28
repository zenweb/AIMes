# Changelog: Scanner guidance links

Date: 2026-06-19

## Changed

- Added bilingual shop-floor scanning guidance before camera scan or manual lookup.
- Added contextual links from the scanner page to:
  - `/production`
  - `/audit-logs`
  - `/report`
  - `#scanner-help`
- Added an in-page `#scanner-help` section for scan context verification before production reporting, scheduling impact review, or kitting review.
- Added unit coverage proving the guidance copy, links, and help anchor render.

## Verification

- RED: `npx vitest run tests/unit/scanner-board.test.ts --coverage.enabled=false -t "guides shop-floor scanning"` failed because `.scanner-guidance` did not exist.
- GREEN: the same targeted test passed after adding scanner guidance and help affordances.
- `npx vitest run tests/unit/scanner-board.test.ts --coverage.enabled=false` passed: 13 tests.
- Regression refresh: `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- Coverage totals: statements 89.71%, branches 77.15%, functions 89.92%, lines 92.83%.
- `npm run lint` passed.

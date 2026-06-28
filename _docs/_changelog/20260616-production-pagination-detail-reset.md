# 2026-06-16 Production Pagination Detail Reset

- Resumed the AIMes V1 continuation from `hold_on` for the active CC remediation goal.
- Added a regression test for `ProductionBoard.vue` pagination: page changes must clear the stale selected work-order detail immediately while the next page is still loading.
- Fixed `ProductionBoard.vue` so `goToPage()` clears selected work order, current operations, barcode context, and barcode evidence trace state before loading the next page.
- Added an audit-only `ScheduleBoard.vue` coverage test for received outsourcing commitments awaiting schedule release review. This test passed before production edits, so no ScheduleBoard production code was changed.
- Preserved the release boundary: strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.

## Red / Green Evidence

- Red test: `npm run test:unit -- tests/unit/production-board.test.ts -t "clears stale work-order detail immediately while loading another page"` failed before the fix because `.detail-title-row h3` still existed after switching to page 2 while the page-2 request was pending.
- Green test: the same command passed after the fix with `1 passed | 35 skipped`.
- Schedule audit test: `npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps received outsourcing orders awaiting schedule release review before marking them archived"` passed with `1 passed | 64 skipped`.

## Verification

- `npm run test:unit:coverage -- tests/unit/production-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 passed`
  - `36 passed`
  - `ProductionBoard.vue`: statements `88.19%`, branches `83.47%`, functions `87.82%`, lines `90.84%`.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 passed`
  - `65 passed`
  - `ScheduleBoard.vue`: statements `88.69%`, branches `68.33%`, functions `77.51%`, lines `89.71%`.
- `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 passed`
  - `1063 passed`
  - totals: statements `89.62%`, branches `77.02%`, functions `89.83%`, lines `92.74%`.

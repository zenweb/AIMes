# 2026-06-16 Scanner Startup Evidence Refresh Fail Loud

- Fixed `ScannerBoard.vue` startup scan-evidence refresh so backend failures no longer escape the mounted hook as unhandled rejections.
- Preserved local scan evidence loaded from browser storage when backend startup refresh fails.
- Kept the startup evidence warning visible while a subsequent successful manual scan renders the local evidence, so the operator can tell the evidence may not be backend-fresh.
- Added a regression test proving local evidence stays visible and the startup backend failure reason is shown.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/scanner-board.test.ts -t "keeps local scan evidence visible and alerts when startup backend evidence refresh fails" --reporter=dot`
  - Expected failure observed: missing `[role="alert"]` plus Vitest-reported unhandled rejection from the mounted hook.
- Green targeted test:
  - Same command passed: `1 passed | 10 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/scanner-board.test.ts --reporter=dot --coverage.reporter=text`
  - `11 passed`.
  - `ScannerBoard.vue`: statements `87.5%`, branches `76.36%`, functions `77.77%`, lines `91.53%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1057 tests passed`.
  - Totals: statements `89.51%`, branches `77.02%`, functions `89.54%`, lines `92.64%`.
- Regression refresh on 2026-06-19:
  - `npm run test:unit:coverage`
  - `111 files / 1083 tests passed`.
  - Totals: statements `89.71%`, branches `77.15%`, functions `89.92%`, lines `92.83%`.

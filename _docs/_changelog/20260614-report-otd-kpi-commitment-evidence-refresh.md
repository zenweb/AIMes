# 2026-06-14 Report OTD KPI Commitment Evidence Refresh

## Change
- Added unit evidence for `ReportBoard.vue` OTD KPI commitment generation.
- Covered the positive path from clicking `生成客户交付恢复承诺包` to:
  - writing the OTD KPI commitment package,
  - refreshing backend-first OTD evidence chain records,
  - rendering the commitment card,
  - rendering the refreshed `客户承诺包` evidence chain card.

## Evidence
- `npm run test:unit -- tests/unit/report-board.test.ts`
  - 1 file passed.
  - 12 tests passed.
- `npm run test:unit:coverage -- tests/unit/report-board.test.ts`
  - `ReportBoard.vue`: lines 76.52%.
- `npm run test:e2e -- tests/e2e/report.spec.ts -g "OTD KPI 可生成客户交付恢复承诺包并进入助手与审计"`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 677 tests passed.
  - global lines 82.77%.

## Notes
- No production code change was required; the existing implementation already generated the commitment package and refreshed evidence records.
- Coverage did not materially move because the path was already executed by surrounding tests; this slice adds C6 decision/evidence depth, not line coverage.
- Gray observation / 15-day monitoring remains skipped/deferred by owner direction and is not counted as a current blocker.

# 2026-06-14 Report OTD KPI Commitment Lock and Evidence

## Change
- Locked the `ReportBoard.vue` OTD KPI commitment action after a commitment package already exists for the selected KPI drilldown.
- Added a handler-level early return so duplicate clicks or scripted triggers cannot write duplicate customer commitment / outsourcing commitment evidence.
- Extended unit and Chromium evidence for both customer commitment and outsourcing commitment branches.

## Evidence
- RED first: `npm run test:unit -- tests/unit/report-board.test.ts -t "locks an OTD KPI commitment package"`
  - Failed because `.kpi-commitment-btn` was not disabled after generation.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts -t "locks an OTD KPI commitment package"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`
  - 18 tests passed.
- `npm run test:e2e -- tests/e2e/report.spec.ts -g "OTD KPI 可生成客户交付恢复承诺包并进入助手与审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:e2e -- tests/e2e/report.spec.ts -g "OTD KPI 产品族外协等待可生成外协承诺包并进入排产与审计" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 764 tests passed.
  - Global lines: 84.00%.
  - `ReportBoard.vue` lines: 78.29%.

## Notes
- Gray observation / 15-day monitoring is skipped by owner instruction and is not a current blocker.
- This slice belongs to existing feature hardening, not new scope expansion.

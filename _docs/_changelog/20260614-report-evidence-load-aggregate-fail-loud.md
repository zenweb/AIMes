# 2026-06-14 Report Evidence Load Aggregate Fail Loud

## Changed
- Hardened the existing ReportBoard optional evidence loading path.
- Aggregated multiple optional report evidence failures into one fail-loud alert instead of letting later failures overwrite earlier failures.
- Kept report dashboard access and local demo review context available when optional evidence reads fail.

## Verification
- `npm run test:unit -- tests/unit/report-board.test.ts` -> 13 passed.
- `npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium` -> 18 passed.
- `npm run test:unit:coverage` -> 105 files passed, 688 tests passed, global line coverage 83.15%, `ReportBoard.vue` line coverage 76.72%.

## Notes
- This is a boutique hardening slice for an existing user-critical reporting surface.
- Gray observation remains owner-skipped/deferred and is not used as a blocking criterion for this slice.

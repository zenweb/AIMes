# 2026-06-15 Changelog: ScheduleImpactPanel coverage

## Changed

- Added focused unit evidence for `ScheduleImpactPanel`.
- Covered the scheduler-facing baseline vs Agent comparison before a plan is adopted.
- Covered the neutral no-regression path so `0` OTD improvement, delayed-order reduction, changeover delta, and utilization delta remain visible instead of disappearing from the decision context.

## Verification

- Baseline before adding the test: focused coverage failed at 0% because `tests/unit/schedule-impact-panel.test.ts` did not exist.
- `npm run test:unit -- tests/unit/schedule-impact-panel.test.ts` => 1 file passed, 2 tests passed.
- `npm run test:unit:coverage -- tests/unit/schedule-impact-panel.test.ts --coverage.include=src/components/schedule/ScheduleImpactPanel.vue` => statements 100%, branches 100%, functions 100%, lines 100%.

## Notes

- No production component logic was changed.
- This keeps the current work on existing-feature evidence hardening, not scope expansion.

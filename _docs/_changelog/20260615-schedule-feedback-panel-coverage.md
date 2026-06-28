# 2026-06-15 Changelog: ScheduleFeedbackPanel coverage

## Changed

- Added focused unit evidence for `ScheduleFeedbackPanel`.
- Covered scheduler feedback submission for accepted and rejected decisions.
- Covered latest feedback display, sync-note announcement, pending feedback state, submitting disabled state, and missing-detail fallback.

## Verification

- Baseline before adding the test: focused coverage failed at 0% because `tests/unit/schedule-feedback-panel.test.ts` did not exist.
- `npm run test:unit -- tests/unit/schedule-feedback-panel.test.ts` => 1 file passed, 5 tests passed.
- `npm run test:unit:coverage -- tests/unit/schedule-feedback-panel.test.ts --coverage.include=src/components/schedule/ScheduleFeedbackPanel.vue` => statements 100%, branches 96.66%, functions 100%, lines 100%.

## Notes

- No production component logic was changed.
- The remaining uncovered branch is the defensive category fallback in `submitDecision`; normal UI selection only produces known category values.

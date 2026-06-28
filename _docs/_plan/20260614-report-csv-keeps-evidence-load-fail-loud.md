# 2026-06-14 Plan - Report CSV Keeps Evidence Load Fail Loud

## Success Criteria
- ReportBoard keeps prior evidence-load fail-loud alerts visible after a successful CSV export.
- CSV export success still clears CSV operation failures.
- The behavior is covered by unit and real Chromium evidence.

## Execution
- Create a focused failing unit test for CSV export after evidence-load failure.
- Fix alert state ownership in `ReportBoard.vue`.
- Add focused Chromium coverage for the same user-visible path.
- Re-run focused, component-level, and coverage verification.

## Validation
- RED unit observed before the fix.
- GREEN focused unit, ReportBoard unit suite, focused Chromium, ReportBoard Chromium suite, and frontend coverage suite.

## Stop Condition
- Stop this slice after the CSV alert lifecycle is verified and documented.
- Do not expand into gray observation, release observation windows, or unrelated ReportBoard enhancements.


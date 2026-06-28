# 2026-06-14 Review - Report CSV Keeps Evidence Load Fail Loud

## Scope
- Reviewed the ReportBoard alert lifecycle after optional evidence loading fails and the user exports CSV successfully.
- Focused on existing reporting UX correctness, fail-loud continuity, and real Chromium evidence.

## Findings
- Prior behavior used one `reportActionError` lane for both startup evidence loading and later user operations.
- A successful CSV export cleared that shared error lane, hiding the earlier evidence-load failure even though the diagnostic condition still mattered.
- The updated behavior separates evidence-load error state from operation error state and recomposes the visible alert, so CSV success only clears CSV operation errors.

## Verification
- RED was observed before the fix on the new unit regression.
- Unit regression: 19/19 `report-board.test.ts` tests passed.
- Real browser regression: 20/20 Chromium `report.spec.ts` tests passed.
- Coverage regression: 774/774 frontend unit tests passed.

## Residual Risk
- Full coverage still emits the existing Node warning: `--localstorage-file was provided without a valid path`.
- This slice does not repair that warning because it is outside the ReportBoard CSV alert lifecycle.
- The worktree contains pre-existing unrelated changes; this review only covers the ReportBoard CSV fail-loud slice.


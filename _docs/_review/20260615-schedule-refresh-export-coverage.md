# 2026-06-15 Review: Schedule refresh and export coverage

Scope reviewed:
- `src/frontend/tests/unit/schedule-board.test.ts`

Findings:
- No production code was changed.
- Manual refresh is now covered as a recovery path: an initial backend fallback warning is cleared when a later backend load succeeds.
- CSV export is now covered from the toolbar event through filename generation and row payload construction.

Residual risk:
- ScheduleBoard still has lower branch/function coverage than adjacent schedule subcomponents because many enrichment sources and suggestion branches remain scenario-heavy.
- This slice is unit evidence only; it does not replace real browser/staging drag and writeback evidence.

Verification:
- Focused ScheduleBoard unit test: 45 passed.
- Full frontend unit coverage: 111 files, 905 tests passed.

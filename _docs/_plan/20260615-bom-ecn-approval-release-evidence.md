# 2026-06-15 Plan: BOM ECN approval release evidence

Success criteria:

- Successful ECN approval must mark the decision as approved.
- The approval audit id must be visible.
- The AI scheduling bridge must describe formal release of the replacement-material window.
- Pending approve/reject actions must disappear after approval.

Execution:

1. Read `BomBoard` tests and ECN approval implementation.
2. Add a focused unit test for successful approval after impact analysis generation.
3. Run focused and file-level tests.
4. Capture focused coverage for `BomBoard.vue`.

Outcome:

- All checks passed and no production code change was needed.

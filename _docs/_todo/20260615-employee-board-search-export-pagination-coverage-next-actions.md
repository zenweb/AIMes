# 2026-06-15 Todo: EmployeeBoard search/export/pagination coverage

- Prefer the next coverage slice from another low-coverage, user-critical existing component instead of continuing to micro-polish EmployeeBoard.
- Candidate next targets from latest full coverage: `PurchaseBoard.vue`, `QualityCapaTaskPanel.vue`, `ChatPanel.vue`, or `AdminBoard.vue`.
- Add real browser evidence only when the runtime/backend path is intentionally being verified; unit coverage for this slice is already strong.

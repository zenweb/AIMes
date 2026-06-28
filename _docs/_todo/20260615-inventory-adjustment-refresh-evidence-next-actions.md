# 2026-06-15 Inventory adjustment refresh evidence next actions

- Continue using full coverage leverage to choose the next slice.
- Candidate next targets from the latest full coverage report: `PurchaseBoard.vue`, `ScheduleBoard.vue`, `BomBoard.vue`, or `ChatPanel.vue`.
- Do not keep refining `InventoryBoard` unless a user-critical uncovered path remains higher leverage than those boards.
- Keep successful operation refresh behavior intact if inventory API contracts are refactored.

# 2026-06-15 Review: inventory adjustment refresh evidence

Scope:

- Covered the core positive inventory operation path for stock adjustment.
- The test locks the refresh behavior after a successful operation instead of only covering failure and dialog accessibility paths.

Findings:

- No production code change was required.
- Existing `confirmDialog` already calls `adjustStock`, closes the dialog, refreshes inventory data, and reselects the updated material by material code.
- The slice was selected from the full coverage report because `InventoryBoard.vue` was below 80% line coverage before this focused addition.

Residual risk:

- Transfer and stock-in success paths are structurally similar but not explicitly covered by this test.

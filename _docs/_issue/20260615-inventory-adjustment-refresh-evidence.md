# 2026-06-15 Issue: inventory adjustment refresh evidence gap

Problem:

- `InventoryBoard` had tests for load failures, transaction fallback, operation failure, and dialog focus recovery.
- The successful stock adjustment path was not explicitly locked, leaving the core inventory update workflow under-evidenced.

Resolution:

- Added a focused unit test for successful stock adjustment.
- The test asserts `adjustStock` receives the selected material code and new quantity, refreshed dashboard/list calls happen, the dialog closes, and the selected material displays the refreshed quantity.

Status:

- Verified by focused, file-level, and focused coverage commands.

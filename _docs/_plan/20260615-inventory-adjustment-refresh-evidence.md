# 2026-06-15 Plan: inventory adjustment refresh evidence

Success criteria:

- A successful inventory adjustment must call the correct API payload.
- The operation dialog must close after success.
- Dashboard/list data must refresh after success.
- The adjusted material must remain selected and display the updated stock value.

Execution:

1. Run full frontend coverage to choose the next high-leverage slice.
2. Read `InventoryBoard` tests and implementation around stock operations.
3. Add a focused unit test for successful adjustment refresh behavior.
4. Run focused, file-level, and focused coverage commands.

Outcome:

- All checks passed and no production code change was needed.

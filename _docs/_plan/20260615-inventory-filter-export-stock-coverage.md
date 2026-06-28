# 2026-06-15 Plan: Inventory filter export and stock operation coverage

Success criteria:
- Cover InventoryBoard material search and type filtering.
- Cover CSV export payload fields.
- Cover successful stock-in and transfer operations, including refresh after writes.
- Cover dashboard/list fallback behavior without hiding the warning.
- Raise focused InventoryBoard function coverage above 80%.
- Verify focused and full frontend unit coverage.

Execution:
1. Inspect current InventoryBoard tests, component behavior, and focused coverage gaps.
2. Add search/filter and export tests.
3. Add stock-in and transfer success-path tests.
4. Add dashboard/list fallback test using the component's demo KPI rules.
5. Run focused unit, focused coverage, and full frontend coverage.

Outcome:
- Completed for this slice. InventoryBoard focused coverage reached statements 95.56%, branches 85.18%, functions 97.29%, lines 98.55%.
- Full frontend unit coverage passed with 111 files and 928 tests.
- Next work should move to another low-coverage user-critical component instead of continuing InventoryBoard micro-polish.

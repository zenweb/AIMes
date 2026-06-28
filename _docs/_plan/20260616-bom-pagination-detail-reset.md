# 2026-06-16 BOM Pagination Detail Reset Plan

## Goal

Ensure BomBoard list pagination cannot leave stale BOM detail, engineering constraint, or explosion context visible after the operator changes pages.

## Success Criteria

- Selecting a BOM on page 1 shows its detail.
- Moving to another list page clears the selected detail.
- Moving to another list page clears any explosion result tied to the old BOM.
- The new page list remains visible and pagination count remains correct.
- Targeted BomBoard tests and full frontend unit coverage remain green.

## Execution

1. Extend the existing pagination test into a red test for stale detail.
2. Confirm the test fails with previous-page BOM detail still visible.
3. Clear `selected` and `explosion` inside `goToPage()`.
4. Re-run the single test, targeted BomBoard coverage, and full frontend coverage.

## Result

All success criteria were met for this slice.

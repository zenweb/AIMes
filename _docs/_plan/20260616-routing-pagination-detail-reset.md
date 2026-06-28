# 2026-06-16 Routing Pagination Detail Reset Plan

## Goal

Keep the routing list and detail panel consistent when operators change pages.

## Success Criteria

- Selecting a route shows its detail.
- Moving to another page loads that page's route list.
- The previous page's selected detail is cleared after pagination.
- Targeted RoutingBoard unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Selected `RoutingBoard.vue` by coverage leverage plus manufacturing workflow value.
2. Read pagination, selection, route detail, and capability validation flow.
3. Added a failing assertion to the pagination test for stale selected detail.
4. Cleared `selected` in `goToPage` before loading the new page.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value from a fresh baseline. Current candidates still include `GanttChart.vue`, `AdminBoard.vue`, `DocumentUpload.vue`, `ScannerBoard.vue`, and `ScheduleBoard.vue`; do not continue RoutingBoard unless the next gap is a concrete operator workflow issue.

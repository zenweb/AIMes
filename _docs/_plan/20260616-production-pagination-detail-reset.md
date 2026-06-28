# 2026-06-16 Production Pagination Detail Reset Plan

## Goal

Prevent stale production work-order details and barcode execution context from remaining actionable while the operator changes pages.

## Success Criteria

- Page navigation immediately clears the previous selected work-order detail.
- Page navigation clears the previous operation list.
- Page navigation clears barcode context and evidence trace state bound to the previous work order.
- The page-2 list can load without reselecting any stale page-1 work order.
- Targeted and full frontend coverage remain green.

## Implementation Steps

1. Add a failing `ProductionBoard.vue` unit test using a deferred page-2 API request.
2. Verify the test fails because the page-1 detail remains visible after clicking page 2.
3. Add the smallest production reset in `goToPage()`.
4. Re-run the failing test and targeted coverage.
5. Run full frontend unit coverage.
6. Record evidence in changelog/review/plan/todo/issue and update `.omx/state/task-hold-on.json`.

## Verification Completed

- Red test observed before implementation.
- Single production pagination test passed after implementation.
- Production targeted coverage passed.
- Schedule targeted coverage passed for the audit-only outsourcing release-review test.
- Full frontend unit coverage passed: `111 files / 1063 tests`.

## Next Routing Rule

Continue by coverage leverage plus user-critical path value. Do not continue `ProductionBoard.vue`, `ScheduleBoard.vue`, `BomBoard.vue`, `ScannerBoard.vue`, or `AdminBoard.vue` by inertia unless a fresh baseline exposes a real workflow gap.

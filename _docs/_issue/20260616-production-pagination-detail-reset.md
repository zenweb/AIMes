# 2026-06-16 Production Pagination Detail Reset Issue

## Issue

When an operator selected a production work order and then paged to another work-order list page, the old work-order detail could remain visible and actionable while the next page request was still pending.

## Impact

This created a stale-detail window in the production reporting workflow. During that window, the UI could still show page-1 operations and barcode evidence context even though the operator had navigated to page 2.

## Fix

`ProductionBoard.vue` now clears selected work-order detail, operation list, barcode context, and barcode evidence trace state immediately in `goToPage()` before loading the new page.

## Evidence

- Red test failed before the fix because the page-1 `.detail-title-row h3` still existed after switching to page 2.
- Green test passed after the fix.
- Production targeted coverage passed: `36 passed`.
- Full frontend coverage passed: `111 files / 1063 tests passed`.

## Status

Fixed and verified.

## Release Boundary

This issue is closed for the quality track, but strict v1.0.0 release readiness still depends on the owner-deferred gray observation gate.

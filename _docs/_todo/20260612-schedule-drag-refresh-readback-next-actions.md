# 2026-06-12 Schedule Drag Refresh Readback Next Actions

## Done In This Slice
- Added real browser evidence for drag-save followed by refresh readback from `GET /api/v1/scheduling/current`.
- Re-ran the real dhtmlx subset and removed the observed flaky first attempt.

## Next
- Keep the current scheduling path focused on polish: if more work is needed, prefer reliability, observability, and user-facing recovery around the same drag-save path before broadening scope.
- Consider one later end-to-end run that combines the real browser flow with a live staging API instead of route mocks, only when the cost is justified.

## Not Current Priority
- Security signoff and gray observation remain release-gate work, but they are not the current feature-depth priority.

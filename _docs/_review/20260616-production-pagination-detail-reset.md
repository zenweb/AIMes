# 2026-06-16 Production Pagination Detail Reset Review

## Decision

Accepted as a narrow boutique-hardening slice for the production reporting path.

## What Changed

- `ProductionBoard.vue` now clears stale detail state immediately when the operator changes pages.
- The reset includes selected work order, loaded operations, barcode production context, and barcode evidence trace badges.
- `production-board.test.ts` now captures the loading-window failure that previously allowed a page-1 work order detail to remain visible after navigating to page 2.
- `schedule-board.test.ts` now documents that received outsourcing orders are still awaiting schedule-release review and are not treated as archived release evidence.

## Risk Review

- The production change is intentionally scoped to pagination. It does not alter scan, start, complete, exception, or status-filter business logic.
- Clearing barcode context during pagination is expected because the context belongs to the previously selected work order.
- Existing dirty worktree changes were not reverted.
- Strict release readiness remains unclaimed because gray observation is still deferred.

## Verification Evidence

- Production pagination red test failed before the fix with stale detail still rendered.
- Production pagination red test passed after the fix.
- Production targeted coverage passed: `36 passed`; `ProductionBoard.vue` lines `90.84%`.
- Schedule targeted coverage passed: `65 passed`; `ScheduleBoard.vue` lines `89.71%`.
- Full frontend coverage passed: `111 files / 1063 tests passed`; statements `89.62%`, branches `77.02%`, functions `89.83%`, lines `92.74%`.

## Remaining Risk

- This slice does not move the owner-deferred gray observation gate.
- No backend, Docker, staging, hosted CI, or real-browser run was executed in this slice.

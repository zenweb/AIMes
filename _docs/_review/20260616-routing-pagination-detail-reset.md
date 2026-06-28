# 2026-06-16 Routing Pagination Detail Reset Review

## Finding

Routing pagination kept stale route details selected after the list moved to another page.

## Impact

An operator could select `传动轴总成工艺路线` on page 1, move to page 2, and see the left list update to `液压阀体工艺路线` while the right detail panel still showed the previous page's route. This weakens the route-management workflow because the visible list and detail panel no longer describe the same page context.

## Fix

- `goToPage` now clears `selected` before loading the requested page.
- The detail panel returns to `选择一个工艺路线查看详情` until the operator selects a route from the new page.

## Verification

- Red/green test cycle completed.
- RoutingBoard targeted suite passed: `12 passed`.
- Full frontend suite passed: `111 files / 1059 tests passed`.

## Remaining Risk

- `RoutingBoard.vue` remains at branches `77.98%`; future work should continue from concrete route-management workflow risks rather than broad refactors.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.

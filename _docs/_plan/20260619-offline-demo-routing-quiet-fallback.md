# 2026-06-19 Plan: Offline Demo Routing Quiet Fallback

## Goal
Make the routing offline demo route boutique enough for user-visible demo use by removing internal backend skip text while preserving real failure visibility.

## Success Criteria
- `/scheduling/routing?offlineDemo=1` has no `Offline demo mode skipped backend request`.
- No route-list failure alert appears for offline demo list skip.
- No capability-history failure alert appears for offline demo history skip.
- Demo routing rows remain visible.
- Ordinary route-list and capability-history backend failures still show alerts.
- Unit, regression, build, and browser evidence pass.

## Execution
1. Confirmed the routing route leakage target from the discovered offline demo route list.
2. Added focused RED tests for route-list and route-capability history skips.
3. Added `OfflineDemoApiError` handling in `loadRoutes()` and `applyStoredRouteCapabilityValidation()`.
4. Ran focused tests, full routing suite, offline demo regression bundle, build, and browser proof.

## Result
All success criteria above were verified on 2026-06-19.

# 2026-06-19 Review: Offline Demo Routing Quiet Fallback

## Findings
- No blocking finding in the routing quiet-fallback slice after verification.
- The implementation filters only `OfflineDemoApiError`; the existing ordinary route-list and capability-history failure tests still prove real failures surface as user-visible alerts.

## Reviewed Scope
- `src/frontend/src/components/routing/RoutingBoard.vue`
- `src/frontend/tests/unit/routing-board.test.ts`

## Verification
- Focused offline demo route-list test failed before the component change and passed after the change.
- Focused offline demo capability-history test failed before the component change and passed after the change.
- Ordinary route-list and capability-history failure tests passed.
- Full routing board test suite passed.
- Offline demo regression bundle passed.
- Production build passed.
- Real browser routing route passed with no backend skip text, no route-list failure, no capability-history failure, and demo routes visible.

## Residual Risk
- Detail readback and capability write/readback operations still intentionally fail loud for real failures.
- Several other offline demo routes still leak backend skip text. They were not modified in this slice to keep the change scoped.

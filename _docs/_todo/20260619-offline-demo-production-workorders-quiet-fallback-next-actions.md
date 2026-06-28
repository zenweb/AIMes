# 2026-06-19 Todo - Offline Demo Production Workorders Quiet Fallback Next Actions

## Done
- Ran a real-browser offline-demo sweep across scheduling routes.
- Found and reproduced the Production page work-order backend-skip leak.
- Added RED test for quiet ProductionBoard offline-demo work-order fallback.
- Added `isOfflineDemoError` check in the initial work-order loading catch path.
- Verified ordinary backend failures still fail loud.
- Rebuilt and rechecked Production with a real browser.

## Next
- Redo the broader offline-demo sweep with a route method that prevents unintended fallback to `/scheduling/dashboard`.
- Treat redirected sweep rows as uncovered, not as clean.
- If the corrected sweep finds another visible `Offline demo mode skipped backend request`, handle it as a narrow RED/GREEN slice.


# 2026-06-19 Plan - Offline Demo Purchase List Quiet Fallback

## Success Criteria
- `/scheduling/purchase?offlineDemo=1` does not show `Offline demo mode skipped backend request`.
- Offline-demo fallback purchase orders remain visible.
- Ordinary backend failures still show the purchase list fallback alert.
- Unit tests, offline-demo regression package, build, and real browser DOM evidence all pass.

## Execution
1. Add a failing test for quiet offline-demo initial purchase list skip.
2. Add a minimal `isOfflineDemoError` check around the existing initial fallback-alert assignment.
3. Run the focused GREEN test and the fail-loud protection test.
4. Run PurchaseBoard full unit suite and the offline-demo regression package.
5. Build production frontend output.
6. Restart local preview on `127.0.0.1:4173`.
7. Verify the real browser DOM for Purchase offline demo.

## Stop Condition
- Stop this slice once PurchaseBoard passes all listed criteria and document the remaining barcode/scanner offline-demo queue separately.


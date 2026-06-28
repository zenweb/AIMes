# 2026-06-19 Plan - Offline Demo Barcode Label Quiet Fallback

## Success Criteria
- `/scheduling/barcode?offlineDemo=1` does not show `Offline demo mode skipped backend request`.
- Offline-demo fallback barcode labels remain visible.
- Ordinary backend failures still show the label list fallback alert.
- Unit tests, offline-demo regression package, build, and real browser DOM evidence all pass.

## Execution
1. Reproduce the Barcode offline-demo leak with a real browser.
2. Add a failing test for quiet offline-demo initial inventory list skip.
3. Add a minimal `isOfflineDemoError` check around the existing fallback-alert assignment.
4. Run the focused GREEN test and the fail-loud protection test.
5. Run BarcodePrintBoard full unit suite and the offline-demo regression package.
6. Build production frontend output.
7. Restart local preview on `127.0.0.1:4173`.
8. Verify the real browser DOM for Barcode offline demo.

## Stop Condition
- Stop this slice once BarcodePrintBoard passes all listed criteria and document the remaining scanner offline-demo queue separately.


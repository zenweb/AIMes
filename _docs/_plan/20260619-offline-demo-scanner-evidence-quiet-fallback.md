# 2026-06-19 Plan - Offline Demo Scanner Evidence Quiet Fallback

## Success Criteria
- `/scheduling/scanner?offlineDemo=1` does not show `Offline demo mode skipped backend request`.
- Scanner guidance, help, and manual scan entry remain visible.
- Ordinary backend evidence refresh failures still show the startup evidence refresh alert.
- Unit tests, offline-demo regression package, build, and real browser DOM evidence all pass.

## Execution
1. Reproduce the Scanner offline-demo leak with a real browser.
2. Add a failing test for quiet offline-demo startup evidence refresh skip.
3. Add a minimal `isOfflineDemoError` check around the existing startup fallback-alert assignment.
4. Run the focused GREEN test and the fail-loud protection test.
5. Run ScannerBoard full unit suite and the offline-demo regression package.
6. Build production frontend output.
7. Restart local preview on `127.0.0.1:4173`.
8. Verify the real browser DOM for Scanner offline demo.

## Stop Condition
- Stop this slice once ScannerBoard passes all listed criteria and queue a broader offline-demo page sweep.


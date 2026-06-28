# 2026-06-19 Todo - Offline Demo Scanner Evidence Quiet Fallback Next Actions

## Done
- Reproduced the Scanner page offline-demo leak in a real browser.
- Added RED test for quiet ScannerBoard offline-demo startup evidence refresh fallback.
- Added `isOfflineDemoError` check in the startup evidence refresh catch path.
- Verified ordinary backend failures still fail loud.
- Rebuilt and rechecked the page with a real browser.

## Next
- Run a broader real-browser offline-demo page sweep to confirm no remaining `Offline demo mode skipped backend request` text is visible across the routed scheduling surface.
- If another visible leak appears, handle it as a narrow slice with RED test, fail-loud protection, build, real browser evidence, and five-document update.
- If the sweep is clean, update the offline-demo remediation summary and move back to the next highest-leverage CC plan item.


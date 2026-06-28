# 2026-06-19 Todo - Offline Demo Purchase List Quiet Fallback Next Actions

## Done
- Added RED test for quiet PurchaseBoard offline-demo initial list fallback.
- Added `isOfflineDemoError` check in the initial purchase list catch path.
- Verified ordinary backend failures still fail loud.
- Rebuilt and rechecked the page with a real browser.

## Next
- Continue the offline-demo leak sweep with `/scheduling/barcode` and `/api/v1/inventory`.
- Then cover `/scheduling/scanner` and `/api/v1/scheduling/barcode-scan-evidence`.
- Keep each next slice narrow: RED test, minimal implementation, fail-loud protection, build, real browser evidence, and five-document update.


# 2026-06-19 Todo - Offline Demo Barcode Label Quiet Fallback Next Actions

## Done
- Reproduced the Barcode page offline-demo leak in a real browser.
- Added RED test for quiet BarcodePrintBoard offline-demo inventory fallback.
- Added `isOfflineDemoError` check in the initial inventory list catch path.
- Verified ordinary backend failures still fail loud.
- Rebuilt and rechecked the page with a real browser.

## Next
- Continue the offline-demo leak sweep with `/scheduling/scanner` and `/api/v1/scheduling/barcode-scan-evidence`.
- Keep the scanner slice narrow: RED test, minimal implementation, fail-loud protection, component suite, offline-demo regression package, build, real browser evidence, and five-document update.


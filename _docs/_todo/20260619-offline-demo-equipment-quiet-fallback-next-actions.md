# 2026-06-19 Todo - Offline Demo Equipment Quiet Fallback Next Actions

## Done
- Added RED tests for quiet EquipmentBoard offline-demo list/statistics fallback.
- Added `isOfflineDemoError` checks in EquipmentBoard list/statistics catch paths.
- Verified ordinary backend failures still fail loud.
- Rebuilt and rechecked the page with a real browser.

## Next
- Continue the offline-demo leak sweep with `/scheduling/purchase` and `/api/v1/purchase`.
- Then cover `/scheduling/barcode` and `/api/v1/inventory`.
- Then cover `/scheduling/scanner` and `/api/v1/scheduling/barcode-scan-evidence`.
- Separately decide whether login redirect should preserve `offlineDemo=1` when a protected page redirects to login.

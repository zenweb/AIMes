# 2026-07-05 Barcode Offline Demo Leak Sweep Changelog

## Added

- Added a Playwright regression proving `barcode?offlineDemo=1` does not call `/api/v1/inventory`.
- Added `_docs/_review/20260705-barcode-offline-demo-leak-sweep.md`.

## Verified

- `npm run test:e2e -- --grep "离线演示条码入口不会触达库存后端接口"`: `1 passed`.

## Result

- Barcode offline-demo leak sweep: `PASS`.
- No production code changed.
- Live deployment observation remains the next release-readiness activity for the DeviceData IOC and queue isolation fixes.

# 2026-07-05 Scanner Offline Demo Leak Sweep Changelog

## Added

- Added a Playwright regression proving `scanner?offlineDemo=1` does not call `/api/v1/scheduling/barcode-scan-evidence`.
- Added `_docs/_review/20260705-scanner-offline-demo-leak-sweep.md`.

## Verified

- `npm run test:e2e -- --grep "离线演示扫码入口不会触达扫码证据后端接口"`: `1 passed`.

## Result

- Scanner offline-demo leak sweep: `PASS`.
- No production code changed.
- Live deployment observation remains the next release-readiness activity for the DeviceData IOC and queue isolation fixes.

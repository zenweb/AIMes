# 2026-06-16 Scanner Startup Evidence Refresh Fail Loud Review

## Finding

Scanner startup evidence refresh awaited the backend without an error boundary.

## Impact

If backend scan-evidence refresh failed on mount, the component emitted an unhandled rejection. The local evidence had already been loaded, but the operator had no visible signal that the evidence was not backend-fresh.

## Fix

- Wrapped startup `readBarcodeScanEvidenceRecordsBackendFirst` in `try/catch`.
- Preserved existing local evidence on failure.
- Kept the startup refresh warning visible through the next successful scan instead of silently clearing it.

## Verification

- Red/green test cycle completed.
- Scanner targeted suite passed: `11 passed`.
- Full frontend suite passed: `111 files / 1057 tests passed`.

## Remaining Risk

- Current frontend regression refresh on 2026-06-19 passed: 111 files / 1083 tests.
- `ScannerBoard.vue` function coverage remains below ideal; further slices should target real camera lifecycle or routing workflow gaps, not cosmetic branches.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.

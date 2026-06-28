# 2026-06-16 Scanner API Payload Shape Fail Loud Review

## Finding

The scanner accepted any successful `/scan/{code}` response as a scan result.

## Impact

If the API or proxy returned an HTML fallback, empty object, or other non-scan payload with HTTP success, the component assigned it to `result`. Rendering then reached `result.type.toLowerCase()` and could crash the scanner page instead of showing a clear operator-facing error.

## Fix

- Added `isScanResult` validation for required scan result fields.
- Added a dedicated fail-loud message for non-scan payloads.
- Prevented malformed successful responses from falling into offline demo fallback, because they represent untrusted backend payload shape rather than a normal offline lookup miss.

## Verification

- Red/green test cycle completed.
- ScannerBoard targeted suite passed: `12 passed`.
- Full frontend suite passed: `111 files / 1060 tests passed`.

## Remaining Risk

- `ScannerBoard.vue` branch coverage is `71.42%`; future slices should target real scanner workflow risks rather than mechanical branch chasing.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.

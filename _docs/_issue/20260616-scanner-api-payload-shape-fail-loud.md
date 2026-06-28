# 2026-06-16 Scanner API Payload Shape Fail Loud Issue

## Status

Closed for this slice.

## Problem

The scanner treated any successful `/scan/{code}` response as a valid `ScanResult`.

Scenario:

- `/scan/WO-RUSH-9001` returns HTTP success with an HTML fallback payload.
- The component assigns that payload to `result`.
- Rendering calls `result.type.toLowerCase()`.
- The scanner page errors instead of showing a clear fail-loud message.

## Resolution

`ScannerBoard.vue` now validates the required scan result shape before assigning `result`. Non-scan payloads show `扫码查询返回非扫码结果载荷`, clear the result, and do not write scan history.

## Evidence

- Regression test failed before the fix because malformed payloads caused `Cannot read properties of undefined (reading 'toLowerCase')` and no alert.
- Regression test passed after the fix: `1 passed | 11 skipped`.
- ScannerBoard targeted coverage passed with `12 passed`.
- Full frontend coverage passed with `111 files / 1060 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.

# 2026-06-19 Review: Scanner evidence fail-loud backend read

## Scope
- Reviewed barcode scan evidence API, sync utility, and `ScannerBoard` startup/post-write refresh paths.

## Finding
- `ScannerBoard` had fail-loud UI handling for backend refresh failures, but the real `queryBarcodeScanEvidence` API helper swallowed backend errors and returned an empty list.
- That meant the fail-loud UI behavior could be proven by mocks but not by the production helper chain.

## Resolution
- Added `{ failLoud?: boolean }` to `queryBarcodeScanEvidence` and `readBarcodeScanEvidenceRecordsBackendFirst`.
- Kept default behavior unchanged for optional evidence consumers.
- Updated `ScannerBoard` to call `readBarcodeScanEvidenceRecordsBackendFirst({ failLoud: true })`.

## Verification
- Targeted RED/GREEN utility test.
- Scanner component suite passed.
- Execution evidence API contract suite passed.
- Full frontend coverage, lint, and build passed.

## Residual Risk
- The backend endpoint itself is still covered by integration tests, but this slice did not run the .NET backend suite.
- Real browser/staging evidence for scanner backend outage UX remains a follow-up.

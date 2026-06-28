# 2026-06-19 Issue - Offline Demo Scanner Evidence Quiet Fallback

## Fixed In This Slice
- Scanner offline demo displayed technical text from the intentional backend skip:
  - `Offline demo mode skipped backend request: /api/v1/scheduling/barcode-scan-evidence`
- The UI now keeps scanner guidance and manual scan entry visible without showing this technical skip message.

## Still Open
- No scanner-specific offline-demo leak remains known after this slice.
- A full routed offline-demo sweep is still needed to prove there are no other visible backend-skip messages.

## Impact
- Scanner page offline demo is quiet for startup barcode evidence refresh fallback.
- Real backend evidence refresh failures still alert the operator, preserving fail-loud behavior outside intentional offline demo skips.


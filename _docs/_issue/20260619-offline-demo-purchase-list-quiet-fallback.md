# 2026-06-19 Issue - Offline Demo Purchase List Quiet Fallback

## Fixed In This Slice
- Purchase offline demo could display technical text from the intentional backend skip:
  - `Offline demo mode skipped backend request: /api/v1/purchase`
- The UI now keeps the local purchase order demo data visible without showing this technical skip message.

## Still Open
- `/scheduling/barcode` still needs the same evidence-driven review for inventory fallback leakage.
- `/scheduling/scanner` still needs the same evidence-driven review for barcode scan evidence fallback leakage.

## Impact
- Purchase page offline demo is quiet for initial purchase list fallback.
- Real backend failures still alert the operator, preserving fail-loud behavior outside intentional offline demo skips.


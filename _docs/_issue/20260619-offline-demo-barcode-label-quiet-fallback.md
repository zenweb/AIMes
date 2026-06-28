# 2026-06-19 Issue - Offline Demo Barcode Label Quiet Fallback

## Fixed In This Slice
- Barcode offline demo displayed technical text from the intentional backend skip:
  - `Offline demo mode skipped backend request: /api/v1/inventory`
- The UI now keeps the local barcode label demo data visible without showing this technical skip message.

## Still Open
- `/scheduling/scanner` still needs the same evidence-driven review for barcode scan evidence fallback leakage.

## Impact
- Barcode print page offline demo is quiet for initial inventory label fallback.
- Real backend failures still alert the operator, preserving fail-loud behavior outside intentional offline demo skips.


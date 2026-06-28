# 2026-06-19 Todo: Scanner evidence readback omission next actions

## Next Actions
- Backend/API contract coverage is partially closed:
  - Frontend helper contract now proves `writeBarcodeScanEvidenceRecordAndReadBack` posts barcode evidence, reads backend evidence, and fails loud if the written record is absent.
  - The helper test also proves the backend-confirmed record refreshes the local OTD evidence-chain trace.
  - Existing backend integration coverage posts `/api/v1/scheduling/barcode-scan-evidence` and then queries `/api/v1/scheduling/barcode-scan-evidence?take=5`.
- Capture real browser evidence for the scanner confirmation alert path if staging exposes the barcode evidence endpoint.
- Keep the fail-loud pattern aligned with report center and audit replay evidence links so operators can jump from scan confirmation to downstream evidence.

## Current Status
- Frontend containment and helper-level write/readback contract are complete and verified.
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.

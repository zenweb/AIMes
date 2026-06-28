# 2026-06-19 Todo: Scanner evidence fail-loud backend read next actions

## Next Actions
- Capture real browser evidence for scanner startup and post-confirmation refresh failure when the backend evidence endpoint is unavailable.
- Run or refresh backend integration evidence for `/api/v1/scheduling/barcode-scan-evidence` before the next release-gate audit.
- Review other optional evidence APIs where UI expects fail-loud behavior but API helpers may still swallow errors.

## Current Status
- Frontend contract split is implemented and verified.
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.

# 2026-06-16 Scanner API Payload Shape Fail Loud Next Actions

- [x] Select a user-critical scanner workflow gap.
- [x] Add a red test for successful HTTP response with non-scan payload.
- [x] Validate scan result payload shape before assigning `result`.
- [x] Keep malformed successful responses out of scan history and demo fallback.
- [x] Run the targeted ScannerBoard regression test.
- [x] Run targeted ScannerBoard coverage.
- [x] Run full frontend coverage.
- [ ] On the next slice, choose by coverage leverage plus user-critical value from a fresh baseline.
- [ ] Keep backend/staging work on `5003`, not `5000`.
- [ ] Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.

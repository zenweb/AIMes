# 2026-06-19 Plan: Offline Demo Anomaly List Quiet Fallback

## Goal
Make the anomaly management offline demo route boutique enough for user-visible demo use by removing internal backend skip text while preserving real failure visibility.

## Success Criteria
- `/scheduling/anomaly?offlineDemo=1` has no `Offline demo mode skipped backend request`.
- No anomaly startup alert appears for offline demo list skip.
- Demo anomaly rows remain visible.
- Ordinary list backend failure still shows an alert.
- Unit, regression, build, and browser evidence pass.

## Execution
1. Browser sweep confirmed anomaly route leakage.
2. Added focused RED test for offline demo anomaly-list skip.
3. Added `OfflineDemoApiError` handling in `loadAnomalies()`.
4. Ran focused tests, full anomaly suite, offline demo regression bundle, build, and browser proof.

## Result
All success criteria above were verified on 2026-06-19.

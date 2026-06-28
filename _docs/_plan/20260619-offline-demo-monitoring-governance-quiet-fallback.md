# 2026-06-19 Plan: Offline Demo Monitoring Governance Quiet Fallback

## Goal
Make the monitoring offline demo route boutique enough for user-visible demo use by removing internal backend skip text while preserving real failure visibility.

## Success Criteria
- `/scheduling/monitoring?offlineDemo=1` has no `Offline demo mode skipped backend request`.
- No monitoring startup governance failure copy appears for offline demo backend skips.
- Demo equipment rows and demo realtime event remain visible.
- Ordinary monitoring governance backend failure still shows a fail-loud message.
- Unit, regression, build, and browser evidence pass.

## Execution
1. Confirmed the monitoring route leakage from startup governance reads.
2. Added focused RED test for offline demo monitoring governance skip.
3. Added `OfflineDemoApiError` handling in the startup catch block without short-circuiting demo data initialization.
4. Ran focused tests, full monitoring suite, offline demo regression bundle, build, and browser proof.

## Result
All success criteria above were verified on 2026-06-19.

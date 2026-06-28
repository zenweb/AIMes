# 2026-06-19 Plan: Offline Demo Inventory List Quiet Fallback

## Goal
Make the inventory offline demo route boutique enough for user-visible demo use by removing internal backend skip text while preserving real failure visibility.

## Success Criteria
- `/scheduling/inventory?offlineDemo=1` has no `Offline demo mode skipped backend request`.
- No inventory list alert appears for offline demo list skip.
- Demo inventory rows remain visible.
- Ordinary list backend failure still shows an alert.
- Unit, regression, build, and browser evidence pass.

## Execution
1. Confirmed the inventory route leakage from the user-visible alert.
2. Added focused RED test for offline demo inventory-list skip.
3. Added `OfflineDemoApiError` handling in `loadData()`.
4. Ran focused tests, full inventory suite, offline demo regression bundle, build, and browser proof.

## Result
All success criteria above were verified on 2026-06-19.

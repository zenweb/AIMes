# 2026-06-19 Plan: Offline Demo BOM List Quiet Fallback

## Goal
Make the BOM offline demo route boutique enough for user-visible demo use by removing internal backend skip text while preserving real failure visibility.

## Success Criteria
- `/scheduling/bom?offlineDemo=1` has no `Offline demo mode skipped backend request`.
- No BOM-list failure alert appears for offline demo list skip.
- Demo BOM records remain visible.
- Ordinary BOM-list backend failure still shows an alert.
- Unit, regression, build, and browser evidence pass.

## Execution
1. Confirmed the BOM route leakage target from the discovered offline demo route list.
2. Added focused RED test for offline demo BOM-list skip.
3. Added `OfflineDemoApiError` handling in `loadBoms()`.
4. Ran focused tests, full BOM suite, offline demo regression bundle, build, and browser proof.

## Result
All success criteria above were verified on 2026-06-19.

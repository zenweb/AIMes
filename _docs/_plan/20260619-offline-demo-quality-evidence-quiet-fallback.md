# 2026-06-19 Plan: Offline Demo Quality Evidence Quiet Fallback

## Goal
Make the quality board `offlineDemo=1` path boutique enough for browser demo use: no internal backend skip text in UI, while real backend failures remain visible.

## Success Criteria
- Offline demo quality page shows local fallback data without `Offline demo mode skipped backend request`.
- No quality startup `[role="alert"]` appears for offline demo backend skips.
- SPC chart still renders after anomaly fallback.
- Real backend failures still fail loud in tests.
- Production build and real browser evidence pass.

## Execution
1. Reproduce in browser and identify leaked backend skip messages.
2. Add focused unit coverage for the discovered offline demo leak.
3. Update only the relevant quality startup catch paths.
4. Run quality suite, cross-page offline regression suite, and build.
5. Restart preview on `127.0.0.1:4173`.
6. Verify quality page and report regression in a real browser.

## Result
All success criteria above were verified on 2026-06-19.

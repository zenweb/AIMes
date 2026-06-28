# 2026-06-19 Plan: Offline demo report evidence quiet fallback

## Success Criteria
- `/scheduling/report?offlineDemo=1` renders Report Center without backend-skip technical alerts.
- The Executive Review Pack and local demo report content remain visible.
- Ordinary report evidence failures still aggregate into a clear fail-loud alert.
- Unit regression, build, and real-browser evidence pass.

## Steps
1. Reproduce the report page leak in a real browser.
2. Locate the adoption feedback and optional evidence aggregation paths.
3. Add a RED test for offline-demo adoption feedback skip.
4. Quiet only `OfflineDemoApiError` and preserve live failure alerts.
5. Run regression, build, restart preview, and verify in a real browser.

## Result
- Success criteria met for the Report Center offline-demo evidence loader slice.
- Broader CC plan completion remains open until all implementation and audit gates have current evidence.

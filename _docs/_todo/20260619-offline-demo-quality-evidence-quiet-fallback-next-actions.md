# 2026-06-19 Next Actions: Offline Demo Quality Evidence Quiet Fallback

## Done
- Quiet fallback for quality inspections in `offlineDemo=1`.
- Quiet fallback for anomaly list in `offlineDemo=1` without interrupting SPC loading.
- Quiet fallback for SPC trend analysis in `offlineDemo=1`.
- Real browser evidence captured for quality page and report regression.

## Next
- Continue real-browser sweep for remaining scheduling routes:
  - `/scheduling`
  - `/scheduling/production`
  - `/scheduling/audit-logs`
- For each discovered `Offline demo mode skipped backend request` leak:
  - add a RED unit test,
  - quiet only `OfflineDemoApiError`,
  - keep real backend failures fail-loud,
  - verify with build and browser evidence.

## Stop Condition
- Offline demo entrance can be called boutique only when all user-critical scheduling routes are browser-verified with no technical backend skip leak.

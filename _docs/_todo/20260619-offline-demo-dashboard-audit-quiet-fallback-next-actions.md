# 2026-06-19 Next Actions: Offline Demo Dashboard And Audit Quiet Fallback

## Done
- Dashboard `/api/v1/dashboard` offline demo skip is quiet.
- Audit log `/api/v1/audit-logs` offline demo skip is quiet.
- Audit replay startup evidence skips are quiet.
- Production route was verified clean without changes.

## Next
- Continue real-browser sweep for remaining sidebar routes not yet proven in this pass:
  - monitoring
  - anomaly
  - risk
  - bom
  - routing
  - equipment
  - inventory
  - purchase
  - barcode print / scanner
- For each leak:
  - add RED unit coverage,
  - quiet only `OfflineDemoApiError`,
  - keep real backend failures fail-loud,
  - rerun targeted suite, regression bundle, build, and browser proof.

## Stop Condition
- All user-critical offline demo routes have real-browser evidence with no `Offline demo mode skipped backend request` in user-visible UI.

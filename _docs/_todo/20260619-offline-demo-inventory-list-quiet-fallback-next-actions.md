# 2026-06-19 Next Actions: Offline Demo Inventory List Quiet Fallback

## Done
- `/scheduling/inventory?offlineDemo=1` no longer shows `Offline demo mode skipped backend request`.
- Demo inventory list remains visible.
- Real inventory-list backend failures remain fail-loud.

## Next
- Continue route-by-route quiet fallback hardening for discovered leaks:
  - monitoring: `/api/v1/scheduling/poc-hypercare-acceptance/latest`
  - BOM: `/api/v1/bom`
  - routing: `/api/v1/routing`, `/api/v1/scheduling/route-capability-validation/latest`
  - equipment: `/api/v1/equipment/statistics`, `/api/v1/equipment`
  - purchase: `/api/v1/purchase`
  - barcode print: `/api/v1/inventory`
  - scanner: `/api/v1/scheduling/barcode-scan-evidence`

## Guardrail
- For each route, quiet only `OfflineDemoApiError`; real backend failures must remain visible.
- Keep running focused RED/GREEN tests, route regression, build, and real browser evidence for each slice.

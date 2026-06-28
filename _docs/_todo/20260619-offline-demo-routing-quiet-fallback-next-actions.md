# 2026-06-19 Next Actions: Offline Demo Routing Quiet Fallback

## Done
- `/scheduling/routing?offlineDemo=1` no longer shows `Offline demo mode skipped backend request`.
- Demo route list remains visible.
- Offline demo route-capability history skip no longer shows `能力校验记录加载失败`.
- Real routing and capability-history backend failures remain fail-loud.

## Next
- Continue route-by-route quiet fallback hardening for discovered leaks:
  - equipment: `/api/v1/equipment/statistics`, `/api/v1/equipment`
  - purchase: `/api/v1/purchase`
  - barcode print: `/api/v1/inventory`
  - scanner: `/api/v1/scheduling/barcode-scan-evidence`

## Guardrail
- For each route, quiet only `OfflineDemoApiError`; real backend failures must remain visible.
- Keep running focused RED/GREEN tests, route regression, build, and real browser evidence for each slice.

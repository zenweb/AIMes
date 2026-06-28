# 2026-06-19 Todo - Offline Demo Auth Entry Query Preservation Next Actions

## Done
- Preserve `offlineDemo` / `demoMode` across unauthenticated protected-route redirects.
- Add Nuxt middleware coverage for the production auth entry path.
- Keep SPA router guard coverage aligned.
- Verify direct Employee offline demo entry with a real browser.

## Next
- Continue offline-demo leak sweep with `/scheduling/purchase` and `/api/v1/purchase`.
- Then cover `/scheduling/barcode` and `/api/v1/inventory`.
- Then cover `/scheduling/scanner` and `/api/v1/scheduling/barcode-scan-evidence`.
- Consider a separate UX improvement to return users to the originally requested protected module after successful login.

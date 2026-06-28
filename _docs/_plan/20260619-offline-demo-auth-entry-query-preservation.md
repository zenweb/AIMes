# 2026-06-19 Plan - Offline Demo Auth Entry Query Preservation

## Success Criteria
- A cleared browser can open a protected offline demo URL and keep explicit offline-demo intent through login.
- Login page shows demo credentials for that entry path.
- Demo login succeeds without live backend auth.
- The target module can render offline demo fallback data without backend-skip leakage.
- Tests and real browser evidence cover the production Nuxt path, not only the legacy SPA router path.

## Execution
1. Add RED coverage for SPA router protected-route redirect preserving `offlineDemo`.
2. Fix SPA router guard.
3. Add RED coverage for Nuxt auth middleware preserving `offlineDemo`.
4. Fix Nuxt auth middleware.
5. Run focused auth tests and offline-demo regression package.
6. Build production frontend.
7. Restart local preview on `127.0.0.1:4173`.
8. Verify direct Employee offline demo entry and demo login in a real browser.

## Stop Condition
- Stop this slice only after the real browser proves the cleared-state entry path and Employee page no longer leak backend-skip text.

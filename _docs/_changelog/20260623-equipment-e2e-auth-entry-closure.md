# 2026-06-23 Changelog: Equipment E2E auth entry closure

- Attempted full frontend E2E with `npm run test:e2e`; the run timed out after the 20-minute command guard before producing a full-suite summary.
- Cleaned up only the residual E2E/preview/Playwright node process chain after the timeout.
- Identified the next full-suite red cluster in `tests/e2e/equipment.spec.ts`.
- Root cause: Equipment E2E entered protected routes with demo-token state but without explicit `offlineDemo=1`, so the auth guard correctly cleared cached demo auth and bounced between login/dashboard before `.equipment-board` rendered.
- Updated Equipment E2E to seed explicit offline-demo auth state and enter protected equipment/scheduling/report/audit/anomaly routes through `?offlineDemo=1`.
- Preserved the empty-list live-mock scenario by switching it to `offlineDemo=0` with backend-style token/refresh state and preventing the suite init script from overwriting that live-mock session on navigation.
- Re-ran Equipment focused validation: `npm run test:e2e -- tests/e2e/equipment.spec.ts` passed 22 Chromium tests.

Boundary:
- This closes the focused Equipment real-browser cluster.
- This does not prove full frontend E2E health; the latest full-suite attempt still timed out before completion.

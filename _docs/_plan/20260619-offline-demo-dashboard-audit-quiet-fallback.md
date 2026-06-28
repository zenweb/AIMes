# 2026-06-19 Plan: Offline Demo Dashboard And Audit Quiet Fallback

## Goal
Continue boutique offline demo hardening by removing user-visible backend skip leaks from the next highest priority scheduling routes.

## Success Criteria
- Dashboard offline demo route has no backend skip text and no data-read alert.
- Audit log offline demo route has no backend skip text and no replay/list alerts.
- Production route remains clean.
- Ordinary backend failures still fail loud in unit tests.
- Build and real browser evidence pass.

## Execution
1. Real-browser sweep dashboard, production, and audit-log routes.
2. Add RED tests for dashboard, audit list, and audit replay offline demo skips.
3. Implement minimal `OfflineDemoApiError` filtering.
4. Run focused tests and ordinary-failure guard tests.
5. Run audit suites, offline demo regression bundle, and production build.
6. Restart preview and verify in real browser.

## Result
All success criteria above were verified on 2026-06-19.

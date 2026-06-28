# 2026-06-19 Plan: Offline demo admin startup quiet fallback

## Success Criteria
- `/scheduling/admin?offlineDemo=1` renders System Management with local fallback data and no backend-skip technical alert.
- Ordinary admin startup failures still show `部分管理数据刷新失败`.
- Employee and document upload offline demo routes remain clean after the admin change.
- Targeted unit tests, production build, and real-browser checks pass.

## Steps
1. Inspect current admin startup error aggregation and existing tests.
2. Add a RED unit test for offline-demo startup skips.
3. Make only `OfflineDemoApiError` quiet in admin startup fallbacks.
4. Update e2e expectation so real 503 failures, not offline-demo skips, prove fail-loud behavior.
5. Run regression, build, restart preview, and verify with real browser.

## Result
- Success criteria met for this targeted offline-demo admin startup path.
- Broader release completion remains open until full CC plan requirements and release gates have current evidence.

# 2026-06-19 Changelog: Offline demo admin startup quiet fallback

## Changed
- System Management startup now ignores intentional `OfflineDemoApiError` failures from admin configuration, notification configuration, and governance evidence loaders.
- Offline demo keeps local admin fallback users/configuration visible without surfacing backend-skip implementation text.
- Ordinary backend failures still aggregate into `部分管理数据刷新失败` so live-mode startup problems remain visible.

## Evidence
- RED: `npm run test:unit -- tests/unit/admin-board.test.ts -t "offline demo skips config"` failed before the generic governance loader ignored offline-demo skips.
- GREEN: `npm run test:unit -- tests/unit/admin-board.test.ts` passed, 32 tests.
- Regression: `npm run test:unit -- tests/unit/admin-board.test.ts tests/unit/employee-board.test.ts tests/unit/document-upload.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` passed, 164 tests.
- Build: `npm run build` passed.
- Real browser: `/scheduling/admin?offlineDemo=1`, `/scheduling/employee?offlineDemo=1`, and `/scheduling/knowledge/documents?offlineDemo=1` show no `Offline demo mode skipped backend request`.
- Screenshot: `20260619-offline-demo-admin-no-backend-skip-alert`.

## Boundary
- This improves offline demo user experience only. It does not prove live admin backend API health or release gray-observation gates.

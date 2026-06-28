# 2026-06-19 Changelog: Offline demo report evidence quiet fallback

## Changed
- Report Center now treats `OfflineDemoApiError` as an intentional offline-demo boundary for optional evidence loaders.
- Latest adoption feedback backend skips no longer surface as `报表证据加载失败`.
- Ordinary report evidence failures still aggregate into the report fail-loud alert.

## Evidence
- RED: `npm run test:unit -- tests/unit/report-board.test.ts -t "offline demo skips latest adoption"` failed before the report evidence loaders ignored offline-demo skips.
- GREEN: `npm run test:unit -- tests/unit/report-board.test.ts` passed, 28 tests.
- Regression: `npm run test:unit -- tests/unit/report-board.test.ts tests/unit/admin-board.test.ts tests/unit/employee-board.test.ts tests/unit/document-upload.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` passed, 192 tests.
- Build: `npm run build` passed.
- Real browser: `/scheduling/report?offlineDemo=1` shows the Executive Review Pack with no `Offline demo mode skipped backend request` and no report evidence alert.
- Screenshot: `20260619-offline-demo-report-no-backend-skip-alert`.

## Boundary
- This is offline-demo presentation hardening. It does not prove live report backend health or release observation gates.

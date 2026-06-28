# 2026-06-19 Changelog: Offline demo backend-skip quiet fallback

## Changed
- Offline demo employee loading now keeps the local sample roster visible without surfacing the technical `OfflineDemoApiError` message.
- Offline demo quality knowledge and customer order import evidence refresh now quietly return local/empty demo state when the backend request is intentionally skipped.
- Live backend failures remain fail-loud so operators still see real integration problems outside offline demo mode.

## Evidence
- Unit: `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts tests/unit/document-upload.test.ts tests/unit/employee-board.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/login-page.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts` passed, 132 tests.
- Build: `npm run build` passed.
- Preview: production preview restarted on `http://127.0.0.1:4173/scheduling`.
- Real browser: `/scheduling/employee?offlineDemo=1` shows `EMP-001` and no `Offline demo mode skipped backend request` or `员工列表加载失败`.
- Screenshot: `20260619-offline-demo-employee-no-backend-skip-alert-final`.

## Boundary
- This is an offline-demo polish fix. It does not prove live backend employee API health, first gray release start, or the two-week no P0/P1 observation window.

# 2026-06-21 Production live scan fallback fail-loud

## Changed

- Hardened `ProductionBoard` live scan behavior so non-offline backend scan failures are surfaced instead of being masked by local demo operation fallback.
- Kept explicit offline demo fallback behavior for `OfflineDemoApiError`, but live backend failures now show error notifications and stop local operation substitution.
- Updated production board unit coverage to use explicit backend operation fixtures for WO-013, WO-008, WO-RUSH-9001, and generic OP-001 flows.
- Aligned barcode completion tests with backend single-operation scan semantics: no synthetic handoff evidence is written when the backend does not return a next operation.

## Evidence

- `npm run test:unit -- tests/unit/production-board.test.ts` -> 41 passed.
- `npm run test:unit -- tests/unit/production-board.test.ts tests/unit/production-api.test.ts` -> 47 passed.
- `npm run build` -> passed.
- Real browser check after restarting preview on 4173:
  - URL: `http://127.0.0.1:4173/scheduling/production?scanCode=WO-013`
  - `WO-013`: present.
  - `OP-10 · 淬火`: present.
  - `人员: EMP-006 替班已确认`: present.
  - `Offline demo mode skipped backend request`: absent.
  - `员工列表加载失败`: absent.
  - `扫码查询失败` / `工序加载失败`: absent.
- Screenshot: `src/frontend/output/playwright/production-wo013-live-fail-loud-check.png`.

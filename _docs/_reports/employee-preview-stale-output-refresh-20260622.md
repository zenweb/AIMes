# Employee Preview Stale Output Refresh - 2026-06-22

## Result

PASS.

## User-visible symptom

The Employee page showed:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Root cause

The source-level Employee offline-demo fallback was already green, but the accessible `4173` preview was serving an older `.output` build from 2026-06-21 23:29.

The focused E2E command rebuilt a temporary `.output-e2e-*` bundle, so it did not refresh the long-running `http://127.0.0.1:4173` preview process.

## Actions

- Rebuilt the production preview bundle with live mode as the default:
  - `VITE_OFFLINE_DEMO=false npm run build`
- Restarted the old `4173` preview process.
- New preview listener:
  - `127.0.0.1:4173`
  - Process id observed after restart: `58136`

## Verification

- Unit:
  - `npm run test:unit -- tests/unit/employee-board.test.ts`
  - Result: 1 file passed, 19 tests passed.
- E2E:
  - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "Offline demo mode skipped backend request|offline demo" --project=chromium`
  - Result: 2 tests passed.
- Real Chromium smoke against the restarted `4173` preview:
  - `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`
  - Redirected to offline demo login as expected.
  - Body did not include `Offline demo mode skipped backend request`.
  - Body did not include `员工列表加载失败`.
  - `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`
  - Redirected to live login as expected.
  - Body did not include `Offline demo mode skipped backend request`.
- Broader offline-demo preview smoke:
  - Checked `dashboard`, `employee`, `production`, `scheduling`, `quality`, `report`, `audit-logs`, `anomaly`, `equipment`, `inventory`, `purchase`, `routing`, `scanner`, `bom`, `monitoring`, `risk`, and `admin`.
  - Each path used `http://127.0.0.1:4173/scheduling/<path>?offlineDemo=1` with a seeded demo admin session.
  - All 17 checked paths returned no visible `Offline demo mode skipped backend request`, no `加载失败`, and no `请求错误`.

## Scope

This proves the current `4173` preview entry is no longer serving stale Employee output. It is not a full release-gate proof and does not complete the global CC plan.

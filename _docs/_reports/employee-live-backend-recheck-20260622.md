# Employee live backend recheck - 2026-06-22

## Scope

Rechecked the reported employee page failure:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Evidence

- Backend health: `http://127.0.0.1:5003/health` returned `200 Healthy`.
- Unauthenticated employee API: `http://127.0.0.1:5003/api/v1/employee` returned `401 Unauthorized`, which is expected without a bearer token.
- Frontend entry: `http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
- Browser storage was cleared before verification.
- Login used `admin / admin123`.
- Browser landed on `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`.
- Browser local storage contained `aimes_offline_demo=false` and live `aimes_token` / `aimes_refresh_token`.
- In-page authenticated `fetch('/api/v1/employee')` returned `200` with JSON employee records including `EMP-001`, `EMP-002`, and `EMP-003`.
- Visible employee page showed backend employee records and did not show the reported offline-demo skip error.

## Result

The live employee backend path is currently working on ports `4173 -> 5003`. The reported message is consistent with a browser session still holding offline demo state or a stale preview output, not with a current backend outage.

## Operator recovery

Use this entry when the page is stuck in offline demo mode:

`http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`

If the old message still appears, clear site data for `127.0.0.1:4173` and login again with `admin / admin123`.

## Verification

- `npm run test:unit -- tests/unit/employee-board.test.ts`
  - Result: `1 passed`, `20 passed`.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-employee-live-backend-evidence.ps1`
  - Result: PASS.
  - Generated repeatable evidence: `_docs/_reports/employee-live-backend-evidence-20260622-current.md`.

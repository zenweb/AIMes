# Employee Live Backend Entry Evidence - 2026-06-22

## Scope

Verified the user-reported employee entry after the visible message:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Environment

- Frontend preview: `http://127.0.0.1:4173/scheduling`
- Backend port rule: avoided `5000`; live API is available through the preview proxy.
- Browser target: real Chromium automation against the running preview.
- Login account: `admin / admin123`

## Procedure

1. Opened `http://127.0.0.1:4173/scheduling/employee`.
2. Confirmed unauthenticated access redirects to:
   - `http://127.0.0.1:4173/scheduling/login?redirect=/employee`
3. Confirmed clean browser storage before login:
   - `aimes_offline_demo=null`
   - `aimes_token=null`
   - `aimes_user=null`
4. Logged in with `admin / admin123`.
5. Waited for the employee board to render.
6. Inspected visible page text and browser storage.

## Result

PASS.

- Final URL: `http://127.0.0.1:4173/scheduling/employee`
- Browser storage after login:
  - `aimes_offline_demo=false`
  - `aimes_token` starts with `eyJhbGciOiJIUzI1NiIs`, which is a live JWT prefix, not `demo-token-`
  - `aimes_user` is `admin / 管理员 / Admin`
- Visible employee page includes live backend employee records:
  - `EMP-001`
  - `EMP-002`
  - `EMP-003`
- Visible page does not contain:
  - `Offline demo mode skipped backend request`
  - `员工列表加载失败`

## Focused Automated Validation

Command:

```powershell
npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/auth.store.test.ts
```

Result:

- Test files: `3 passed`
- Tests: `51 passed`

## Diagnosis

The currently running `4173` preview can reach the live employee path when entered without stale offline-demo state and after live login. The reported raw skip message is consistent with stale offline-demo browser state or stale preview output, not with the current verified live entry.

## Non-Claims

- This is not a full all-module release gate.
- This does not complete the global CC plan.
- Existing staged Agent E2E package was not modified.

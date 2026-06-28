# Employee live backend offline-demo recovery evidence - 2026-06-22

## Scope

- Page: `http://127.0.0.1:4173/scheduling/employee`
- Login: `admin / admin123`
- Backend port: `5003`
- User-visible issue: `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Root cause evidence

The backend was healthy during verification:

```text
GET http://127.0.0.1:5003/health -> 200 Healthy
```

The failure text is generated before a network request is sent when the browser is in offline demo mode. The affected browser session can hold stale values such as:

```text
aimes_offline_demo=true
aimes_token=demo-token-...
```

Those values make the frontend intentionally skip `/api/v1/employee` and fall back to local demo employees.

## Live browser verification

After clearing stale browser storage and logging in with `admin / admin123`, a real Chromium run reached the live employee page.

Observed browser state:

```json
{
  "href": "http://127.0.0.1:4173/scheduling/employee",
  "offline": "false",
  "tokenPrefix": "eyJhbGciOiJIUzI1",
  "user": "{\"username\":\"admin\",\"displayName\":\"管理员\",\"role\":\"Admin\",\"mustChangePassword\":false}"
}
```

Observed requests:

```text
POST http://127.0.0.1:4173/api/v1/auth/login -> 200
GET  http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20 -> 200
```

Observed page content included live backend employees:

```text
EMP-001 · 班组A · 白班
EMP-002 · 班组A · 白班
EMP-003 · 班组A · 白班
```

The page did not show:

```text
Offline demo mode skipped backend request
员工列表加载失败
```

## In-page live recovery affordance

When the employee page is intentionally serving local demo employees because offline-demo mode skipped `/api/v1/employee`, the page now shows a bilingual recovery prompt:

```text
当前展示本地示例数据
Current view is using local demo data
切换在线后端
```

The recovery link points to:

```text
/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0
```

This keeps the recovery path visible to operators instead of requiring browser developer tools or prior knowledge of the query flag, and preserves the return target after live backend authentication.

Real browser closure on the refreshed `4173` preview:

```text
1. Opened /scheduling/employee?offlineDemo=1 and logged in with the demo admin session.
2. Employee page showed the bilingual recovery prompt and local demo employees without surfacing `Offline demo mode skipped backend request`.
3. Recovery link resolved to /scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0.
4. Clicking the link set `aimes_offline_demo=false` and landed on the live login page with the employee redirect preserved.
5. Logging in with `admin / admin123` returned to /scheduling/employee?offlineDemo=0 with a real JWT, `EMP-001` / `张三`, no recovery prompt, no employee load failure, and no offline-demo skip text.
```

## Automated verification

Focused unit coverage:

```text
npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts tests/unit/offline-demo-mode.test.ts

Test Files  4 passed (4)
Tests       68 passed (68)
```

Focused E2E coverage:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee offline demo entry"

Tests       2 passed
```

Recovery-link E2E coverage:

```text
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"

Tests       1 passed
```

Staged-index recovery-link E2E coverage:

```text
git show :src/frontend/tests/e2e/employee.spec.ts -> temporary worktree file
npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"

Tests       1 passed
```

The recovery-link behavior is now covered by the staged `tests/e2e/employee.spec.ts` hunk so future changes must preserve the visible prompt, link target, and offline-demo state switch.

Live Chromium verification:

```text
POST http://127.0.0.1:4173/api/v1/auth/login -> 200
GET  http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20 -> 200
aimes_offline_demo=false
hasOfflineSkipText=false
hasEmployeeLoadFailure=false
hasEmployee001=true
```

Follow-up real browser recheck after user reported the visible skip text:

```text
URL: http://127.0.0.1:4173/scheduling/employee?offlineDemo=0
Frontend: 127.0.0.1:4173 listening
Backend: 5003 listening
aimes_offline_demo=false
token: real JWT, not demo-token-*
hasOfflineSkipText=false
hasLiveRecoveryPrompt=false
visible live employees: EMP-001 张三, EMP-002 李四, EMP-003 王五
```

This recheck confirms the remaining failure mode is stale browser state or an `offlineDemo=1` entry URL, not a backend outage.

Second follow-up after the user still saw the employee fallback:

```text
Root cause: 4173 was held by an old node preview process serving stale Nuxt HTML/resource hashes.
Action: stopped the old 4173 node process, rebuilt `src/frontend`, and restarted `node ./scripts/preview.mjs` with `VITE_API_TARGET=http://127.0.0.1:5003`.
GET http://127.0.0.1:5003/health -> 200 Healthy
POST http://127.0.0.1:4173/api/v1/auth/login admin/admin123 -> 200
GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20 -> 200
Real browser URL after login: http://127.0.0.1:4173/scheduling/employee?offlineDemo=0
aimes_offline_demo=false
visible backend employees: EMP-001 张三, EMP-002 李四, EMP-003 王五
hasOfflineSkipText=false
hasEmployeeLoadFailure=false
```

This proves the latest user-visible fallback was caused by a stale preview runtime, not by Docker, PostgreSQL, API auth, or the employee endpoint.

Third live-browser recheck after the user still reported the fallback text:

```text
URL: http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0
Login: admin / admin123
POST http://127.0.0.1:4173/api/v1/auth/login -> 200
GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20 -> 200
GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20 -> 200
Final URL: http://127.0.0.1:4173/scheduling/employee?offlineDemo=0
aimes_offline_demo=false
token prefix: eyJhbGciOiJIUzI1NiIs
hasOfflineSkipText=false
hasLocalDemoPrompt=false
visible backend employees include EMP-001 / 张三
```

This confirms that the current 4173 runtime and 5003 backend path are healthy when entering through the live login URL. If the operator still sees `Offline demo mode skipped backend request`, the browser tab is not on this recovered live path or is carrying stale storage/cache state.

## Operator recovery command

If a browser is already stuck in stale demo mode, run this in the browser console once:

First try the in-page recovery link:

```text
切换在线后端
```

If storage is corrupted and the link cannot recover the session, use the browser console fallback:

```js
localStorage.clear()
location.href = '/scheduling/login'
```

Then log in again with `admin / admin123` and open:

```text
http://127.0.0.1:4173/scheduling/employee
```

## Boundary

- This report proves the current live backend path is reachable and not blocked by Docker, PostgreSQL, or the API server.
- The current worktree also contains frontend hardening that clears stale demo sessions and suppresses technical offline-demo skip errors in explicit demo mode.
- This report does not claim full frontend E2E health; it covers only the employee offline-demo entry and recovery-link behavior.

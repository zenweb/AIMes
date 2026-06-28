# Employee Live Browser Recheck - 2026-06-22

## Scope

Rechecked the employee list entry after the user reported:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Environment

- Frontend preview: `http://127.0.0.1:4173/scheduling`
- Backend proxy target: live API through preview proxy
- Backend port rule: did not use port `5000`
- Login entry: `http://127.0.0.1:4173/scheduling/login?offlineDemo=0`
- Account: `admin`

## Browser Procedure

1. Opened the login page with `offlineDemo=0`.
2. Cleared stale browser auth/demo state:
   - `aimes_offline_demo=false`
   - removed `aimes_token`
   - removed `aimes_refresh_token`
   - removed `aimes_user`
3. Logged in with the live admin account.
4. Opened `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`.
5. Captured API requests and visible body text.

## Result

PASS.

- `POST /api/v1/auth/login` returned `200`.
- `GET /api/v1/employee?page=1&pageSize=20` returned `200`.
- Browser local storage after login:
  - `aimes_offline_demo=false`
  - `aimes_token` starts with a live JWT prefix, not `demo-token-`
  - `aimes_user` is `admin / 管理员 / Admin`
- Visible page did not contain:
  - `Offline demo mode skipped backend request`
  - `员工列表加载失败`

## Diagnosis

The reported failure matches stale offline demo browser state or an offline-demo URL entry. When `aimes_offline_demo=true` and the current token is missing or demo-token based, the HTTP request interceptor intentionally skips backend calls and raises `OfflineDemoApiError`.

Using `offlineDemo=0` and clearing the stale local storage state restores the live employee request path.

## Non-Claims

- This is a live-browser recovery verification, not a full all-module E2E sweep.
- No code was changed in this verification.
- Existing staged release candidate files were not modified.

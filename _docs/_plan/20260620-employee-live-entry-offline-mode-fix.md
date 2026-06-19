# 2026-06-20 Plan: Employee live entry offline mode fix

## Success Criteria

- A normal local preview login must call the backend unless the URL or stored state explicitly requests offline demo mode.
- The employee page must not surface `Offline demo mode skipped backend request`.
- The employee page must not show `员工列表加载失败` when the backend is healthy and authenticated.
- The user must have a concrete local entry URL and credentials.

## Completed

- Reproduced the auth-store behavior with a red unit test.
- Changed demo preference to require explicit offline demo mode.
- Restored a local Docker admin account for the current staging database.
- Started a stable local 4173 entry using a local proxy to the built frontend and API.
- Verified with unit tests, build, direct API login, and browser DOM inspection.

## Next

- If the team wants production preview on 4173 without a local proxy, add a first-class Nitro route/proxy configuration for `/api` and `/hubs`.
- Review the shell `离线` label separately if it is meant to represent backend/API connectivity.

# 2026-06-22 Changelog: Employee live login database credential recovery

- Restored the local Docker PostgreSQL demo credentials for `admin/admin123` and `operator1/operator123`.
- Verified `system_users.admin` and `system_users.operator1` are active and `must_change_password=false`.
- Real browser verification used `http://127.0.0.1:4173/scheduling/login?offlineDemo=0`, logged in as `admin/admin123`, then opened `/scheduling/employee?offlineDemo=0`.
- Result: employee page stayed in live mode, `aimes_offline_demo=false`, no `Offline demo mode skipped backend request`, and no `当前展示本地示例数据`.
- Rechecked the same live path after user reported the offline skip text again:
  - `http://127.0.0.1:5003/api/v1/auth/login` accepted `admin/admin123`.
  - Authenticated `GET http://127.0.0.1:5003/api/v1/employee?page=1&pageSize=20` returned HTTP 200 with `EMP-001`, `EMP-002`, and `EMP-003`.
  - Browser page `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0` showed the same three backend employees and kept `aimes_offline_demo=false`.

Boundary:
- No application source files were changed.
- Existing staged release-candidate slice was not modified.

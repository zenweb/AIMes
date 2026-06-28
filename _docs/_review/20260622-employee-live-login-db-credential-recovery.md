# 2026-06-22 Review: Employee live login database credential recovery

Evidence:
- `aimes-api` was running on port 5003.
- `aimes-pg` was healthy.
- Unauthenticated `GET /api/v1/employee` returned 401, proving the endpoint existed and backend routing was live.
- `system_users` contained `admin` and `operator1`, but browser login with the expected local demo credential failed before recovery.
- After credential recovery, browser login with `admin/admin123` produced a JWT token and `aimes_offline_demo=false`.
- Browser opened `/scheduling/employee?offlineDemo=0`; page did not contain `Offline demo mode skipped backend request` or `当前展示本地示例数据`.
- Follow-up recheck after the user saw the skip text again:
  - `GET /api/v1/employee?page=1&pageSize=20` on backend port 5003 returned HTTP 200 with three live rows after login.
  - The 4173 preview rendered `EMP-001 张三`, `EMP-002 李四`, and `EMP-003 王五`, matching the backend response rather than the nine-row fallback fixture.

Risks:
- This changes local Docker database state only; rebuilding or replacing the database volume may require reseeding credentials again.
- The employee page currently shows a valid labor-constraint alert unrelated to the employee list loading failure.
- A browser tab that was previously opened with `offlineDemo=1` can still persist offline mode until the user opens `?offlineDemo=0`, logs in live, or clears localStorage.

No source code or staged candidate files were changed.

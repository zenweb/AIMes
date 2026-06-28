# 2026-06-22 Issue: Employee page fell back after demo-token/offline state

The employee page showed:

```text
员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee
```

Root cause:
- `/api/v1/employee` was online but protected; unauthenticated requests returned 401.
- Browser/demo sessions with demo tokens intentionally skip backend requests in offline demo mode.
- The local Docker PostgreSQL `admin` account existed but no longer accepted the expected local demo password, so live login could not recover the browser into a real JWT session.

Resolution:
- Rehashed the local Docker PostgreSQL `admin` password to `admin123`.
- Rehashed the local Docker PostgreSQL `operator1` password to `operator123`.
- Set both accounts active and `must_change_password=false` for local demo/live verification.

This was an environment data drift issue, not a source-code defect in `EmployeeBoard.vue`.

Follow-up:
- A later user report showed the same offline skip text, but live recheck proved the backend and preview path were healthy when entered with `offlineDemo=0`.
- The remaining recurrence mode is stale browser demo state or a tab opened through an offline-demo entrypoint, not a currently reproduced backend/API failure.

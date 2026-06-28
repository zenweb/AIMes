# 2026-06-22 Employee live backend recheck

- Rechecked the employee page live backend path with real browser evidence.
- Confirmed `4173 -> 5003` live employee reads pass after clearing stale offline demo state and logging in with `admin / admin123`.
- Added `scripts/run-employee-live-backend-evidence.ps1` plus an opt-in `[employee-live-backend]` Playwright regression for the operator-facing recovery path.

# 2026-06-22 Employee Live Browser Recheck

## Changed

- Added live browser recheck evidence for the employee list offline-demo skip report.
- Confirmed the live login and employee list path work when `offlineDemo=0` is used and stale demo local storage is cleared.

## Evidence

- `_docs/_reports/employee-live-browser-recheck-20260622.md`

## Result

- `POST /api/v1/auth/login`: 200
- `GET /api/v1/employee?page=1&pageSize=20`: 200
- No visible employee loading failure or offline-demo skip text after recovery.

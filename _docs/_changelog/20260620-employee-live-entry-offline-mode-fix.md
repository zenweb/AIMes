# 2026-06-20 Changelog: Employee live entry offline mode fix

- Fixed ordinary preview login so it remains backend-first and no longer turns a normal local session into persisted offline demo mode.
- Added a focused auth-store regression test proving ordinary preview login calls the backend and does not set `aimes_offline_demo=true`.
- Prepared the current local Docker staging database with `admin / admin123` for live browser access.
- Added a local-only 4173 proxy helper so `http://127.0.0.1:4173/scheduling/login` serves the built frontend while forwarding `/api` and `/hubs` to the API on `5003`.
- Verified the employee page in a real browser: no `Offline demo mode skipped backend request`, no `员工列表加载失败`, and live employee data renders.

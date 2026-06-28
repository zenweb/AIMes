# Plan: Frontend Preview SignalR Live Entry

## Goal
Make the 4173 production preview usable as a live entry: authenticated employee data and SignalR realtime status should both reach the 5003 backend.

## Steps
1. Reproduce and isolate hub failures from employee API failures.
2. Add a focused frontend URL resolver test for standalone preview SignalR hubs.
3. Route notification/dashboard/monitoring SignalR connections through the resolver.
4. Add backend CORS evidence for credentialed local preview SignalR.
5. Add docker-compose local preview origins.
6. Verify with unit tests, integration tests, build, CORS preflight, Docker API restart, and real browser.

## Success Criteria
- `/api/v1/employee` loads through 4173 after backend login.
- `/hubs/notifications/negotiate` and `/hubs/monitoring/negotiate` return 200 from 5003.
- Page shows realtime online status.
- No `Offline demo mode skipped backend request` and no hub negotiate console errors.

# Review: Frontend Preview SignalR Live Entry

## Scope
- `src/frontend/src/utils/signalr-url.ts`
- `src/frontend/src/stores/notifications.ts`
- `src/frontend/src/components/dashboard/DashboardBoard.vue`
- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
- `src/frontend/tests/unit/signalr-url.test.ts`
- `src/tests/MES.Tests.Integration/Security/CorsPolicyTests.cs`
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs`
- `docker-compose.yml`

## Findings
- No blocking issue found in this slice.
- Production CORS remains whitelist-based via `AllowedOrigins`; the credentialed wildcard behavior is limited to the development `AllowAll` policy.
- Docker compose now explicitly lists the local 4173 preview origins, so the production container still runs with an origin allowlist.

## Evidence
- Targeted frontend unit tests: PASS.
- Targeted backend integration CORS tests: PASS.
- Frontend production build: PASS.
- Docker API rebuild/restart: PASS.
- Real browser employee entry: PASS with SignalR negotiate 200 and no hub console errors.

## Residual Risk
- If the preview port changes away from 4173, compose `AllowedOrigins` and `resolveSignalRHubUrl` must be updated together.

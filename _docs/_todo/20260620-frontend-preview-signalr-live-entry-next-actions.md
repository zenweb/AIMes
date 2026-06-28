# Todo: Frontend Preview SignalR Live Entry Next Actions

- If local preview moves from 4173 to another port, update both `resolveSignalRHubUrl` behavior and docker-compose `AllowedOrigins`.
- Consider adding a Playwright smoke test that logs in through 4173 and asserts realtime status is online.
- Keep Production CORS whitelist evidence in `CorsPolicyTests` when editing CORS policy.

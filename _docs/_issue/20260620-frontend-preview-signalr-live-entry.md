# Issue: 4173 Preview SignalR Live Entry

## Symptom
The employee page could load backend data after login, but the shell remained offline and browser console showed hub negotiate failures.

## Root Cause
- The standalone 4173 Nuxt preview cannot reliably proxy SignalR WebSocket/SSE traffic through Nitro routeRules.
- Switching hubs to direct 5003 access exposed a second issue: the dockerized production API did not include the 4173 preview origin in `AllowedOrigins`.

## Fix
- Resolve SignalR hub URLs to `http://<current-hostname>:5003/hubs/...` when the app runs on 4173.
- Add 4173 origins to docker-compose production CORS configuration.
- Ensure development `AllowAll` can support credentialed local SignalR while keeping Production whitelist behavior.

## Evidence
- Real browser reports `/hubs/notifications/negotiate` and `/hubs/monitoring/negotiate` as 200.
- Real browser employee page reports no employee fallback error and no hub errors.

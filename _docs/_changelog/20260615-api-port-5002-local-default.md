# 2026-06-15 Changelog: API port 5002 local default

- Updated `src/backend/MES.Api/Properties/launchSettings.json` so local `dotnet run` HTTP profiles use `http://localhost:5002`.
- Updated `src/frontend/nuxt.config.ts` so the default `/api` and `/hubs` proxy target is `http://localhost:5002`.
- Updated README local development notes from the old `5147` backend default to `5002`.

## Validation

- `rg -n "localhost:5000|127\\.0\\.0\\.1:5000|5000:5000|localhost:5147|127\\.0\\.0\\.1:5147|http://\\+:5147|applicationUrl.*5147" -S README.md docker-compose.yml src\\backend\\MES.Api\\Properties\\launchSettings.json src\\frontend\\nuxt.config.ts src\\frontend\\scripts scripts _docs\\SOP.md _docs\\quickstart.md _docs\\troubleshooting.md --glob "!src/frontend/node_modules/**" --glob "!src/backend/MES.Api/wwwroot/**"` returned no matches.
- `docker compose config --format json` reports API published port `5002`, target port `5002`, and `ASPNETCORE_URLS=http://+:5002`.

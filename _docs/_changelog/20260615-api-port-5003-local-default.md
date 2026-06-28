# 2026-06-15 API port 5003 local default

## Changed

- Moved the current AIMes API default from host/API port `5002` to `5003` because this machine already has another service listening on `5002`.
- Updated Docker Compose, Dockerfile, backend launch settings, Nuxt API proxy default, staging rehearsal scripts, and current operator docs to use `http://localhost:5003`.
- Aligned the backend startup banner fallback URL and live staging e2e default API URL to `http://localhost:5003`.
- Kept historical reports unchanged; older evidence may still truthfully mention prior `localhost:5000` or `localhost:5002` runs.

## Verification

- `Get-NetTCPConnection -LocalPort 5003` => no listener, port is free.
- `docker compose config` => API `ASPNETCORE_URLS=http://+:5003`, `target: 5003`, `published: "5003"`.
- Scoped runtime scans for `localhost:5000` and `localhost:5002` returned no current entry-point matches.
- Follow-up scoped scan confirmed no host `localhost:5000`, `127.0.0.1:5000`, or `5000:5000` remains in current runtime/script/operator entry points.
- Follow-up scoped scan confirmed no host `localhost:5002`, `127.0.0.1:5002`, `5002:5002`, or `5002:5003` remains in current runtime/script/operator entry points.
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore --verbosity minimal` => 0 warnings, 0 errors.

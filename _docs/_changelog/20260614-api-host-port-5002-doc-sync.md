# API host port 5002 doc sync

## Changed

- Updated current Quickstart, SOP, and Troubleshooting operator-facing instructions to use `http://localhost:5002` for the AIMes API host entry point.
- Updated README Docker Compose access URLs and `VITE_API_TARGET` guidance from host `5000` to host `5002`.
- Updated the SOP startup-failure cause from generic port `5000` contention to host port `5002` contention.
- Kept the container-internal API listener on `5000`; Docker Compose publishes it as host `5002` to avoid occupying host port `5000`.

## Validation

- `rg -n "localhost:5000|127\\.0\\.0\\.1:5000|5000:5000" -S docker-compose.yml scripts src\frontend\tests src\backend _docs\quickstart.md _docs\SOP.md _docs\troubleshooting.md --glob "!src/frontend/node_modules/**" --glob "!src/backend/MES.Api/wwwroot/**"` returned no current runtime/documentation matches.
- `rg -n "localhost:5000|127\\.0\\.0\\.1:5000|5000:5000|连接 Docker Compose 暴露的 `5000`|端口 5000 被占用" README.md _docs\quickstart.md _docs\SOP.md _docs\troubleshooting.md docker-compose.yml -S` returned no scoped current runtime matches.
- `docker compose config --format json` reports API port mapping `published: "5002"`, `target: 5000`.
- `docker compose config | Select-String -Pattern 'published: "5002"|target: 5000|ASPNETCORE_URLS' -Context 0,1` confirmed host `5002`, container `5000`, and `ASPNETCORE_URLS=http://+:5000`.

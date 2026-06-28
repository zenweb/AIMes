# API host port 5002 next actions

- Keep using `http://localhost:5002` for Docker-backed local/staging API checks.
- If host port `5002` is occupied by another local service, either free that process or explicitly choose another published host port in `docker-compose.yml`.
- Do not change the container-internal API port from `5000` unless there is a separate runtime need; the current goal is only to avoid host port `5000`.
- Leave historical evidence files alone unless they are being regenerated; old reports may still truthfully mention `localhost:5000` from previous runs.

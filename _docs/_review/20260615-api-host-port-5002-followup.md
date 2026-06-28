# 2026-06-15 Review: API host port 5002 follow-up

## Result
- Pass. Current runtime config and operator-facing entry points avoid host port `5000`.

## Checks
- Docker Compose publishes API as host `5002` to container target `5002`.
- Frontend staging E2E default uses `AIMES_LIVE_API_BASE_URL` fallback `http://localhost:5002`.
- Updated remaining copy-paste review/todo examples that could steer a staging run back to `localhost:5000`.
- Updated remaining current quick-start/marketing/pre-launch instructions that could steer a fresh local run back to `localhost:5000`.

## Notes
- Historical evidence reports were not rewritten; they may still truthfully mention the port used during older runs.
- Container-internal API `5000` is no longer used; API logs and host access should both point at `5002`.

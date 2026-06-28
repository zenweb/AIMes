# 2026-06-15 API port 5003 local default review

## Findings

- No code-review blocker found in the port-only change.
- The previous `5002` default was valid in repo terms, but unsafe on this workstation because `5002` is already occupied.
- The new default avoids both forbidden host `5000` and occupied host `5002`.

## Evidence

- Docker Compose resolves API to `5003:5003`.
- Backend `launchSettings.json`, frontend `nuxt.config.ts`, and staging scripts now default to `http://localhost:5003`.
- Backend startup banner fallback and live staging e2e default API now also resolve to `http://localhost:5003`.
- Current runtime/operator docs no longer steer new local runs to `localhost:5000` or `localhost:5002`.
- Backend build passes after the follow-up alignment.

## Residual Risk

- Historical reports still contain older ports by design.
- If another process later occupies `5003`, use `AIMES_API_HOST_PORT=5004` and `VITE_API_TARGET=http://localhost:5004`.

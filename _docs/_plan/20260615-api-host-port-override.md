# 2026-06-15 API Host Port Override Plan

## Goal

Keep new backend/browser/staging work off host port `5000`, while preserving a simple default on `5002`.

## Steps

1. Verify current runtime configuration for stale `5000` defaults.
2. Add a Docker Compose host-port override for the API service.
3. Update operator-facing docs with the default `5002` and explicit `5003` conflict path.
4. Validate Compose config for default and override cases.
5. Continue feature-quality work using a non-5000 backend URL.

## Success Criteria

- Default Compose config publishes API on host `5002`.
- Override Compose config can publish API on host `5003`.
- Current runtime/operator guidance does not direct new runs to host `5000`.

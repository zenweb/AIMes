# 2026-06-15 Plan: staging Docker API 500 release gate

## Success Criteria

- Docker engine is checked once with direct CLI commands.
- PostgreSQL/staging rehearsal produces a current report using `http://localhost:5003`.
- Release gate audit is regenerated from the current staging report.
- If Docker is still unavailable, stop retrying and fail loud.

## Steps

1. Run `docker info`, `docker ps`, and confirm `5003` is not occupied.
2. Run `run-staging-rehearsal.ps1` with `-ApiBaseUrl http://localhost:5003` and short Docker timeouts.
3. Run `run-release-gate-audit.ps1` with gray observation deferred by owner.
4. Record the resulting gate state in changelog, review, todo, issue, and plan.

## Result

Docker engine is still unavailable through Docker Desktop LinuxEngine API; staging and release gate audit both remain FAIL. Stop Docker retries for this slice.

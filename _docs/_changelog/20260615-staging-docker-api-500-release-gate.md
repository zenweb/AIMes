# 2026-06-15 Staging Docker API 500 release gate

## Changed

- Re-ran PostgreSQL/staging rehearsal on the current `http://localhost:5003` API default after the workstation Docker status changed.
- Generated a fresh release gate audit from the new staging report.
- Stopped Docker retry attempts after current evidence showed Docker Desktop Linux engine API failure.

## Evidence

- Staging report: `_docs/_reports/staging-rehearsal-20260615-5003-docker-api-500.md`.
- Release gate audit: `_docs/_reports/release-gate-audit-20260615-5003-docker-api-500.md`.

## Verification

- `docker info` timed out after 30 seconds with Docker Desktop LinuxEngine API 500.
- `docker ps` timed out after 30 seconds with Docker Desktop LinuxEngine API 500.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260615-5003-docker-api-500.md -ApiBaseUrl http://localhost:5003 -DockerEngineTimeoutSeconds 10 -DockerPullTimeoutSeconds 30 -ImagePullMode Missing` => report generated, Result: FAIL.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260615-5003-docker-api-500.md ... -DeferGrayObservation` => report generated, Result: FAIL.

## Gate Status

- Hosted CI: PASS.
- Attack Chain A/B/C: PASS.
- Security signoff: PASS.
- Gray observation: DEFERRED_BY_OWNER.
- PostgreSQL/staging: FAIL.

The v1.0.0 release gate is still not closed.

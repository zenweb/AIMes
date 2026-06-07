# Staging engine fail-loud

## Change

- Added an explicit Docker engine preflight step to `scripts/run-staging-rehearsal.ps1`.
- Generated `_docs/_reports/staging-rehearsal-20260607-engine-unavailable.md`.
- Refreshed `_docs/_reports/release-gate-audit-20260607-current.md` to point at the latest staging evidence.

## Why

The staging gate previously failed at image resolution. Current environment fails earlier: Docker CLI is installed, but the Docker Desktop Linux engine API pipe is unavailable. The report now fails at `Docker engine` with a direct daemon error before attempting image pulls.

## Verification

- `run-staging-rehearsal.ps1`: expected FAIL at Docker engine preflight.
- PowerShell parser for `run-staging-rehearsal.ps1`: PASS.
- `dotnet test ... --filter "StagingRehearsal|ReleaseGateAudit"`: 12/12 PASS.


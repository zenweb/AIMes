# Review: Staging engine fail-loud

## Scope

- Script: `scripts/run-staging-rehearsal.ps1`.
- Reports: `_docs/_reports/staging-rehearsal-20260607-engine-unavailable.md`, `_docs/_reports/release-gate-audit-20260607-current.md`.

## Findings

- The script now distinguishes Docker CLI availability from Docker daemon availability.
- The staging report fails before registry diagnostics when `docker info` cannot connect to `dockerDesktopLinuxEngine`.
- No production code or release gate predicate was weakened.

## Residual risk

PostgreSQL/staging remains open until Docker Desktop Linux engine is running, dependency containers start, EF migrations apply, API starts, and `/live` plus `/ready` return HTTP success.


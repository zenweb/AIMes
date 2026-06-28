# 2026-06-15 backend baseline and 5003 staging gate

## Changed

- Re-ran the non-frontend backend baseline after moving active local API defaults to `5003`.
- Generated fresh staging rehearsal evidence at `_docs/_reports/staging-rehearsal-20260615-5003-current.md`.
- Generated fresh release gate audit at `_docs/_reports/release-gate-audit-20260615-5003-staging-engine-timeout.md`.

## Backend Baseline

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore` => PASS, 444 tests.
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore` => PASS, 115 tests after serial rerun.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore` => PASS, 203 tests.
- `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj --no-restore` => PASS, 2 tests.
- `dotnet test src/tests/MES.Benchmarks/MES.Benchmarks.csproj --no-restore` => process exited 0; no test summary emitted.

## Release Gate

- Staging rehearsal result: FAIL.
- Root evidence: `docker info` timed out after 30 seconds; separate `docker info` and `docker ps` probes also timed out.
- Release gate audit result: FAIL.
- Current failing gate: PostgreSQL/staging.
- Hosted CI, Attack Chain A/B/C, and Security signoff remain PASS from existing evidence.
- Gray observation remains `DEFERRED_BY_OWNER` per owner decision.
